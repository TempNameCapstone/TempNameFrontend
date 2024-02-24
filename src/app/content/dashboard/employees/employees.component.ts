import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { TuiTableFiltersModule, TuiTableModule } from '@taiga-ui/addon-table';
import { TuiLetModule } from '@taiga-ui/cdk';
import { TuiInputModule, TuiTagModule } from '@taiga-ui/kit';
import { TuiButtonModule, TuiPrimitiveTextfieldDirective, TuiSvgModule, TuiTextfieldControllerModule, } from '@taiga-ui/core';
import { PageComponent } from '../../../shared/components/page-component';
import { PageService } from '../../../shared/services/page.service';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ProfileComponent } from '../../../shared/components/profile/profile.component';

interface User {
    readonly email: string;
    readonly name: string;
    readonly status: 'alive' | 'deceased';
    readonly tags: readonly string[];
}

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
    ngOnInit(){
        this.setTitle("Employees");
    }

    constructor(pageService: PageService) {
        super(pageService);

        this.currentUser = true;
    }

    readonly form = new FormGroup({
        input: new FormControl(""),
        filters: new FormControl([])
    });

    currentUser: User | boolean;

    users: readonly User[] = [
        {
            name: 'Michael Palin',
            email: 'm.palin@montypython.com',
            status: 'alive',
            tags: ['Funny'],
        },
        {
            name: 'Eric Idle',
            email: 'e.idle@montypython.com',
            status: 'alive',
            tags: ['Funny', 'Music'],
        },
        {
            name: 'John Cleese',
            email: 'j.cleese@montypython.com',
            status: 'alive',
            tags: ['Funny', 'Tall', 'Actor'],
        },
        {
            name: 'Terry Jones',
            email: '',
            status: 'deceased',
            tags: ['Funny', 'Director'],
        },
        {
            name: 'Terry Gilliam',
            email: 't.gilliam@montypython.com',
            status: 'alive',
            tags: ['Funny', 'Director'],
        },
        {
            name: 'Graham Chapman',
            email: '',
            status: 'deceased',
            tags: ['Funny', 'King Arthur'],
        },
    ];

    readonly nameFilter = (item: string, value: string): boolean => item.includes(value);

    readonly columns = Object.keys(this.users[0]);
}
