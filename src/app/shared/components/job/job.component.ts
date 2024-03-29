import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from '@angular/router';
import { JobInfoComponent } from './job-info/job-info.component';
import { BaseComponent } from '../base-component';
import { TuiDialogService, TuiSvgModule } from '@taiga-ui/core';
import { TUI_PROMPT, TuiPromptModule, TuiTabsModule } from '@taiga-ui/kit';
import { SessionService } from '../../services/session.service';
import { SessionType } from '../../../models/session.model';
import { AssignedEmployee, Employee } from '../../../models/employee';
import { JobsService } from '../../services/jobs.service';
import { BehaviorSubject, Observable, of, switchMap, take, tap } from 'rxjs';
import { AssignmentConflictType, Job } from '../../../models/job.model';
import { CommonModule, NgClass } from '@angular/common';
import { TuiLetModule } from '@taiga-ui/cdk';

@Component({
    selector: 'app-job',
    standalone: true,
    imports: [JobInfoComponent, RouterOutlet, RouterModule, TuiLetModule, NgClass, 
        TuiSvgModule, TuiTabsModule, CommonModule, TuiPromptModule],
    templateUrl: './job.component.html',
    styleUrl: './job.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobComponent extends BaseComponent {
    job$: Observable<Job | undefined>;
    jobSessionState = this.session.scheduleSessionState.jobSessionState;
    assignmentAvailable$ = this.jobSessionState.assignmentAvailable$.asObservable(); 
    alreadyAssigned$ = this.jobSessionState.alreadyAssigned$.asObservable();
    employeeToBoot$ = this.jobSessionState.employeeToBoot$.asObservable();
    isFull$ = new BehaviorSubject<boolean>(false);

    warningDialogOpen = false;

    constructor(
        @Inject(SessionType.Employee) private session: SessionService<Employee>,
        @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
        private jobsService: JobsService,
        private route: ActivatedRoute,
        private router: Router) {
        super();
    }

    ngOnInit() {
        const jobId = this.route.snapshot.paramMap.get("jobId") ?? "";
        this.job$ = this.jobsService.getJob(jobId);
        this.job$.subscribe(job => {
            if (job)
                this.isFull$.next(job.assignedEmployees.length >= job.numberWorkers);
        });
        this.jobSessionState.jobId = jobId;

        this.navigateToTab(this.session.scheduleSessionState.tabIndex);
        this.syncJobSessionState(jobId);
    }

    openWarningDialog(employeeToBoot: AssignedEmployee) {
        this.dialogs.open<boolean>(TUI_PROMPT, {
            label: 'Warning',
            data: {
              content: `This will boot ${employeeToBoot.firstName} ${employeeToBoot.lastName}`,
              yes: 'Ok',
              no: 'Cancel',
            },
        }).subscribe(yes => {
            if (yes){
                this.selfAssign();
            }
        });
	}

    selfAssign() {
        this.job$.pipe(
            take(1),
            switchMap(job => job ? 
                this.jobsService.selfAssign(job.jobId!) : 
                of(undefined))
        ).subscribe(_ => {
            this.job$.pipe(take(1)).subscribe(job => job ?
                this.syncJobSessionState(job.jobId) : null)
        });
    }

    selfRemove() {
        this.job$.pipe(
            take(1),
            switchMap(job => job ? 
                this.jobsService.selfRemove(job.jobId!) : 
                of(undefined))
        ).subscribe(_ => {
            this.job$.pipe(take(1)).subscribe(job => job ?
                this.syncJobSessionState(job.jobId) : null)
        });
    }

    setTabIndex(tabIndex: number){
        this.session.scheduleSessionState.tabIndex = tabIndex;
    }

    syncJobSessionState(jobId: string) {
        this.jobsService.checkAssignmentAvailability(jobId)
            .subscribe(res => {
                if (typeof res === 'string') {
                    switch (res) {
                        case AssignmentConflictType.AlreadyAssigned:
                            this.jobSessionState.alreadyAssigned$.next(true);
                            break;
                        case AssignmentConflictType.JobFull:
                            this.jobSessionState.assignmentAvailable$.next(false);
                            break;
                    }
                    this.jobSessionState.employeeToBoot$.next(null);
                }
                else {
                    this.jobSessionState.assignmentAvailable$.next(true);
                    this.jobSessionState.alreadyAssigned$.next(false);
                    this.jobSessionState.employeeToBoot$.next(res);
                }           
            })
    }

    private navigateToTab(tabIndex: number){
        const jobId = this.route.snapshot.paramMap.get("jobId") ?? "";

        let tabRoute = `dashboard/schedule/job/${jobId}`;
        switch (tabIndex){
            case 0:
                tabRoute += "/info";
                break;
            case 1:
                tabRoute += "/workers";
                break;
            case 2:
                // TODO
                tabRoute += "/workers";
                break;
        }
        this.router.navigate([tabRoute]);
    }

    back() {
        this.session.scheduleSessionState.tabIndex = 0;
        this.jobSessionState.clear();
        this.router.navigate(["/dashboard/schedule"]);
    }
}
