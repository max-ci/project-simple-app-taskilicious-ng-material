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
} from 'rxjs';
import { CategoryModel } from '../../models/category.model';
import { TeamMemberModel } from '../../models/team-member.model';
import { CategoryService } from '../../services/category.service';
import { TaskService } from '../../services/task.service';
import { TeamMemberService } from '../../services/team-member.service';
import { FileService } from '../../services/file.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { UploadcareFile } from '@uploadcare/upload-client';

@Component({
  selector: 'app-create-task',
  styleUrls: ['./create-task.component.scss'],
  templateUrl: './create-task.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateTaskComponent {
  readonly form: FormGroup = new FormGroup({
    name: new FormControl(),
    categoryId: new FormControl(),
    teamMemberIds: new FormArray([]),
    imageUrl: new FormControl(''),
  });

  private _loadingCreateTaskSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public loadingCreateTask$: Observable<boolean> = this._loadingCreateTaskSubject.asObservable();

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
      tap((queryParams: Params) => {
        this.form.patchValue({ categoryId: queryParams['initialCategoryId'] });
      })
    )
    .subscribe();

  readonly teamMembers$: Observable<TeamMemberModel[]> = this._teamMemberService.getAll().pipe(
    take(1),
    tap((teamMembers: TeamMemberModel[]) => {
      teamMembers.forEach((teamMember: TeamMemberModel) => {
        this.teamMemberIdsFormArray.push(
          new FormGroup({
            [teamMember.id]: new FormControl(),
          })
        );
      });
    })
  );

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
    private _sanitize: DomSanitizer
  ) {}

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

  onFormSubmitted(form: FormGroup): void {
    if (!form.valid) {
      return;
    }
    this._loadingCreateTaskSubject.next(true);
    const teamMemberIds: string[] = this.getAssignedTeamMembersToTask(form.value.teamMemberIds);

    this._imageToUpload
      .pipe(
        switchMap((imageToUpload: File | null) =>
          imageToUpload ? this._fileService.upload(imageToUpload) : of(null)
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
        catchError((err) => {
          this._loadingCreateTaskSubject.next(false);
          throw err;
        })
      )
      .subscribe(() => {
        this._router.navigateByUrl(`/categories/${form.value.categoryId}`);
      });
    return;
  }

  getAssignedTeamMembersToTask(teamMemberIds: { [key: string]: true | null }[]): string[] {
    return teamMemberIds.reduce((acc: string[], curr: { [key: string]: true | null }) => {
      for (let key in curr) {
        if (curr[key] === true) {
          acc.push(key);
        }
      }
      return acc;
    }, []);
  }
}
