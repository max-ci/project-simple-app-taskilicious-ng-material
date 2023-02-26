import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
  BehaviorSubject,
  Observable,
  Subject,
  Subscription,
  catchError,
  switchMap,
  take,
  tap,
  of,
  filter,
  EMPTY,
  combineLatest,
  map,
} from 'rxjs';
import { CategoryModel } from '../../models/category.model';
import { TeamMemberModel } from '../../models/team-member.model';
import { CategoryService } from '../../services/category.service';
import { TaskService } from '../../services/task.service';
import { TeamMemberService } from '../../services/team-member.service';
import { FileService } from '../../services/file.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { UploadcareFile } from '@uploadcare/upload-client';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TaskModel } from '../../models/task.model';

@Component({
  selector: 'app-task-form',
  styleUrls: ['./task-form.component.scss'],
  templateUrl: './task-form.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskFormComponent {
  readonly form: FormGroup = new FormGroup({
    name: new FormControl(),
    categoryId: new FormControl(),
    teamMemberIds: new FormArray([]),
    imageUrl: new FormControl(''),
  });

  private _loadingCreateOrUpdateSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  public loadingCreateOrUpdate$: Observable<boolean> =
    this._loadingCreateOrUpdateSubject.asObservable();

  private _loadingTaskSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public loadingTask$: Observable<boolean> = this._loadingTaskSubject.asObservable();

  private _uploadProgressSubject: Subject<number> = new Subject<number>();
  public uploadProgress$: Observable<number> = this._uploadProgressSubject.asObservable();

  private _headingTextSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public headingText$: Observable<string> = this._headingTextSubject.asObservable();

  private _submitButtonText: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public submitButtonText$: Observable<string> = this._submitButtonText.asObservable();

  private readonly _createRoute$: Observable<Params> = this._activatedRoute.params.pipe(
    filter((params: Params) => !params['id']),
    take(1),
    tap(() => {
      this._headingTextSubject.next('Create new task');
      this._submitButtonText.next('Create');
    })
  );

  private readonly _updateRoute$: Observable<Params> = this._activatedRoute.params.pipe(
    filter((params: Params) => params['id']),
    take(1),
    tap(() => {
      this._loadingTaskSubject.next(true);
      this._headingTextSubject.next('Edit task');
      this._submitButtonText.next('Update');
    })
  );

  private _categoriesSubject: Subject<CategoryModel[]> = new Subject<CategoryModel[]>();
  public categories$: Observable<CategoryModel[]> = this._categoriesSubject.asObservable();

  private _imageToUploadPreview: Subject<SafeUrl> = new Subject<SafeUrl>();
  public imageToUploadPreview$: Observable<SafeUrl> = this._imageToUploadPreview.asObservable();

  private _imageToUpload: BehaviorSubject<File | null> = new BehaviorSubject<File | null>(null);

  private readonly _getCategoriesAndSetInitialValue$: Subscription = this._categoryService
    .getAll()
    .pipe(
      tap((categories: CategoryModel[]) => {
        this._categoriesSubject.next(categories);
      }),
      switchMap(() => this._activatedRoute.queryParams),
      take(1),
      filter((queryParams: Params) => queryParams['initialCategoryId']),
      tap((queryParams: Params) => {
        this.form.patchValue({ categoryId: queryParams['initialCategoryId'] });
      }),
      catchError(() => {
        this._showMessage('An error occurred');
        return EMPTY;
      })
    )
    .subscribe();

  private _teamMembersSubject$: Subject<TeamMemberModel[]> = new Subject<TeamMemberModel[]>();
  public teamMembers$: Observable<TeamMemberModel[]> = this._teamMembersSubject$.asObservable();

  get teamMemberIdsFormArray(): FormArray {
    return this.form.controls['teamMemberIds'] as FormArray;
  }

  constructor(
    private _categoryService: CategoryService,
    private _taskService: TaskService,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _teamMemberService: TeamMemberService,
    private _fileService: FileService,
    private _sanitize: DomSanitizer,
    private _snackbar: MatSnackBar
  ) {
    this._initCreateRoute();
    this._initUpdateRoute();
  }

  private _initCreateRoute(): void {
    this._createRoute$
      .pipe(
        switchMap(() =>
          this._teamMemberService.getAll().pipe(
            take(1),
            catchError(() => {
              this._showMessage('An error occurred');
              return EMPTY;
            }),
            tap((teamMembers: TeamMemberModel[]) => {
              teamMembers.forEach((teamMember: TeamMemberModel) => {
                this.teamMemberIdsFormArray.push(
                  new FormGroup({
                    [teamMember.id]: new FormControl(),
                  })
                );
              });

              this._teamMembersSubject$.next(teamMembers);
            })
          )
        )
      )
      .subscribe();
  }

  private _initUpdateRoute(): void {
    this._updateRoute$
      .pipe(
        switchMap((params: Params) =>
          combineLatest([this._taskService.getOne(params['id']), this._teamMemberService.getAll()])
        ),
        catchError(() => {
          this._showMessage('An error occurred');
          return EMPTY;
        }),
        take(1),
        map(([task, teamMembers]: [TaskModel, TeamMemberModel[]]) => {
          this.form.patchValue(task);
          if (task.imageUrl) {
            this._imageToUploadPreview.next(this._sanitize.bypassSecurityTrustUrl(task.imageUrl));
          }

          teamMembers.forEach((teamMember: TeamMemberModel) => {
            const teamMemberToTask = task.teamMemberIds?.includes(teamMember.id) ? true : null;

            this.teamMemberIdsFormArray.push(
              new FormGroup({
                [teamMember.id]: new FormControl(teamMemberToTask),
              })
            );
          });

          this._loadingTaskSubject.next(false);
          this._teamMembersSubject$.next(teamMembers);
        })
      )
      .subscribe();
  }

  onFileChanged(event: any): void {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    let fileReader: FileReader = new FileReader();
    fileReader.onloadend = () => {
      this._imageToUploadPreview.next(
        this._sanitize.bypassSecurityTrustUrl(fileReader.result as string)
      );
      this._imageToUpload.next(file);
    };

    fileReader.readAsDataURL(file);
  }

  deleteImageFromTask(): void {
    this._imageToUploadPreview.next('');
    this._imageToUpload.next(null);
    this.form.patchValue({ imageUrl: '' });
  }

  onFormSubmitted(form: FormGroup): void {
    if (!form.valid) {
      return;
    }
    this._loadingCreateOrUpdateSubject.next(true);

    const teamMemberIds: string[] = this._getAssignedTeamMembersToTask(form.value.teamMemberIds);

    this._onFormSubmittedCreateRoute(form, teamMemberIds);
    this._onFormSubmittedUpdateRoute(form, teamMemberIds);
  }

  private _onFormSubmittedCreateRoute(form: FormGroup, teamMemberIds: string[]): void {
    this._createRoute$
      .pipe(
        switchMap(() => this._imageToUpload),
        switchMap((imageToUpload: File | null) =>
          imageToUpload
            ? this._fileService.upload(imageToUpload, (progress) => {
                progress?.isComputable && this._uploadProgressSubject.next(progress.value * 100);
              })
            : of(null)
        ),
        switchMap((image: UploadcareFile | null) =>
          this._taskService.create({
            name: form.value.name,
            categoryId: form.value.categoryId,
            teamMemberIds: teamMemberIds,
            imageUrl: image ? (image.cdnUrl as string) : form.value.imageUrl,
          })
        ),
        take(1),
        catchError(() => {
          this._showMessage('An error occurred');
          this._loadingCreateOrUpdateSubject.next(false);
          this._uploadProgressSubject.next(0);
          return EMPTY;
        })
      )
      .subscribe(() => {
        this._showMessage('Task added');
        this._router.navigateByUrl(`/categories/${form.value.categoryId}`);
      });
  }

  private _onFormSubmittedUpdateRoute(form: FormGroup, teamMemberIds: string[]): void {
    this._updateRoute$
      .pipe(
        switchMap(() => this._imageToUpload),
        switchMap((imageToUpload: File | null) =>
          combineLatest([
            this._activatedRoute.params,
            imageToUpload
              ? this._fileService.upload(
                  imageToUpload,
                  (progress) =>
                    progress?.isComputable && this._uploadProgressSubject.next(progress.value * 100)
                )
              : of(null),
          ])
        ),
        switchMap(([params, image]: [Params, UploadcareFile | null]) =>
          this._taskService.update(params['id'], {
            name: form.value.name,
            categoryId: form.value.categoryId,
            teamMemberIds: teamMemberIds,
            imageUrl: image ? (image.cdnUrl as string) : form.value.imageUrl,
          })
        ),
        take(1),
        catchError(() => {
          this._showMessage('An error occurred');
          this._loadingCreateOrUpdateSubject.next(false);
          this._uploadProgressSubject.next(0);
          return EMPTY;
        })
      )
      .subscribe(() => {
        this._showMessage('Task updated');
        this._router.navigateByUrl(`categories/${form.value.categoryId}`);
      });
  }

  private _getAssignedTeamMembersToTask(teamMemberIds: { [key: string]: true | null }[]): string[] {
    return teamMemberIds.reduce((acc: string[], curr: { [key: string]: true | null }) => {
      for (let key in curr) {
        if (curr[key] === true) {
          acc.push(key);
        }
      }
      return acc;
    }, []);
  }

  private _showMessage(message: string): void {
    this._snackbar.open(message, undefined, {
      duration: 3000,
    });
  }
}
