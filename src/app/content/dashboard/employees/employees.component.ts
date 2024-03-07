import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { TuiTableFiltersModule, TuiTableModule } from '@taiga-ui/addon-table';
import { TuiLetModule } from '@taiga-ui/cdk';
import { TuiInputModule, TuiTagModule } from '@taiga-ui/kit';
import { TuiButtonModule, TuiSvgModule, TuiTextfieldControllerModule } from '@taiga-ui/core';
import { PageComponent } from '../../../shared/components/page-component';
import { PageService } from '../../../shared/services/page.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ProfileComponent } from '../../../shared/components/profile/profile.component';
import { Employee } from '../../../models/user';
import { UsersService } from '../../../shared/services/users.service';
import { BehaviorSubject, Observable, Subscription, combineLatest, of } from 'rxjs';
import { map, startWith, debounceTime } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
    selector: 'app-employees',
    standalone: true,
    imports: [TuiTableModule, TuiTagModule, NgIf, NgFor,
        TuiInputModule, TuiTableFiltersModule, TuiButtonModule,
        TuiLetModule, TuiButtonModule, TuiSvgModule, ProfileComponent,
        ReactiveFormsModule, CommonModule, TuiTextfieldControllerModule],
    templateUrl: './employees.component.html',
    styleUrl: './employees.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeesComponent extends PageComponent {
    subscriptions: Subscription[] = [];
    employees$ = new BehaviorSubject<Employee[]>([]);
    filteredEmployees$: Observable<Employee[]> = new Observable<Employee[]>;

    ngOnInit() {
        this.setTitle("Employees");
        // Fetch all employees once
        const usersSub = this.usersService.getEmployees().subscribe(employees => this.employees$.next(employees) );
        this.subscriptions.push(usersSub);

        this.filteredEmployees$ = combineLatest([this.employees$, this.searchInput.valueChanges.pipe(startWith(''))]).pipe(
            debounceTime(100),
            map(([employees, filterValue]) => employees.filter(employee => {
                filterValue = (filterValue ?? "").toLowerCase();
                
                const fullName = `${employee.firstName} ${employee.lastName}`;
                return fullName.toLowerCase().includes(filterValue) ||
                    employee.email.toLowerCase().includes(filterValue) ||
                    employee.employeeType.toLowerCase().includes(filterValue)
            }))
        );
    }

    constructor(pageService: PageService, private usersService: UsersService, private router: Router) {
        super(pageService);
    }
    
    openEmployee(userName?: string) {
        this.router.navigate(["/dashboard/employees/profile", userName ?? ""])
    }

    searchInput = new FormControl('');

    readonly columns = ["name", "email", "employeeType"];

    ngOnDestroy(){
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }
}
