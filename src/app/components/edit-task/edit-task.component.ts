import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
  BehaviorSubject,
  catchError,
  Observable,
  switchMap,
  take,
  combineLatest,
  map,
  Subject,
  of,
} from 'rxjs';
import { TaskModel } from '../../models/task.model';
import { CategoryModel } from '../../models/category.model';
import { TaskService } from '../../services/task.service';
import { CategoryService } from '../../services/category.service';
import { TeamMemberModel } from '../../models/team-member.model';
import { TeamMemberService } from '../../services/team-member.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FileService } from '../../services/file.service';
import { UploadcareFile } from '@uploadcare/upload-client';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-edit-task',
  styleUrls: ['./edit-task.component.scss'],
  templateUrl: './edit-task.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditTaskComponent {
  readonly form: FormGroup = new FormGroup({
    name: new FormControl(),
    categoryId: new FormControl(),
    teamMemberIds: new FormArray([]),
    imageUrl: new FormControl(),
  });

  private _loadingUpdateTaskSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public loadingUpdateTask$: Observable<boolean> = this._loadingUpdateTaskSubject.asObservable();

  private _imageToUploadPreview: Subject<SafeUrl> = new Subject<SafeUrl>();
  public imageToUploadPreview$: Observable<SafeUrl> = this._imageToUploadPreview.asObservable();

  private _imageToUpload: BehaviorSubject<File | null> = new BehaviorSubject<File | null>(null);

  public teamMembers$: Observable<TeamMemberModel[]> = this._activatedRoute.params.pipe(
    switchMap((params: Params) =>
      combineLatest([this._taskService.getOne(params['id']), this._teamMemberService.getAll()])
    ),
    take(1),
    map(([task, teamMembers]: [TaskModel, TeamMemberModel[]]) => {
      this.form.patchValue(task);
      if (task.imageUrl) {
        this._imageToUploadPreview.next(this._sanitize.bypassSecurityTrustUrl(task.imageUrl));
      }

      teamMembers.forEach((teamMember: TeamMemberModel) => {
        const teamMemberTask = task.teamMemberIds?.includes(teamMember.id) ? true : null;

        this.teamMemberIdsFormArray.push(
          new FormGroup({
            [teamMember.id]: new FormControl(teamMemberTask),
          })
        );
      });

      return teamMembers;
    })
  );

  readonly categories$: Observable<CategoryModel[]> = this._categoryService.getAll();

  get teamMemberIdsFormArray(): FormArray {
    return this.form.controls['teamMemberIds'] as FormArray;
  }

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _taskService: TaskService,
    private _teamMemberService: TeamMemberService,
    private _categoryService: CategoryService,
    private _fileService: FileService,
    private _sanitize: DomSanitizer,
    private _snackbar: MatSnackBar
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
    this._loadingUpdateTaskSubject.next(true);
    const teamMemberIds: string[] = this.getAssignedTeamMembersToTask(form.value.teamMemberIds);

    this._imageToUpload
      .pipe(
        switchMap((imageToUpload: File | null) =>
          combineLatest([
            this._activatedRoute.params,
            imageToUpload ? this._fileService.upload(imageToUpload) : of(null),
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
        catchError((err) => {
          this._loadingUpdateTaskSubject.next(false);
          throw err;
        })
      )
      .subscribe(() => {
        this._snackbar.open('Task updated', undefined, {
          duration: 3000,
        });
        this._router.navigateByUrl(`categories/${form.value.categoryId}`);
      });
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
