import { NgFor, NgClass, NgIf, CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { TuiDataListModule, TuiHostedDropdownComponent, TuiHostedDropdownModule, TuiSvgModule } from '@taiga-ui/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { TuiAvatarModule } from '@taiga-ui/kit';
import { TuiSurfaceModule } from '@taiga-ui/experimental';
import { BaseComponent } from '../base-component';
import { filter } from 'rxjs/operators';
import { Observable, Subscription, of } from 'rxjs';
import { SessionService } from '../../services/session.service';
import { Employee } from '../../../models/user';

type SidebarItem = {
    readonly name: string
    readonly icon: string
    readonly route: string
}

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [NgFor, TuiSvgModule, NgClass, RouterModule, TuiAvatarModule, NgIf, CommonModule,
        TuiSurfaceModule, TuiHostedDropdownModule, TuiDataListModule],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent extends BaseComponent {
    @ViewChild(TuiHostedDropdownComponent)
    component?: TuiHostedDropdownComponent;

    user$: Observable<Employee| undefined> = of(undefined);
    routerEventSub: Subscription;
    
    dropdownOpen: boolean = false;
    profileOpen: boolean = false;

    ngOnInit(){
        this.user$ = this.session.getUser();

        this.routerEventSub = this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe(_ => {
            this.profileOpen = this.router.url.includes("/dashboard/profile");
        });
    }

    constructor(private router: Router, private session: SessionService) {
        super();
    }

    openProfile(userName: string) {
        this.dropdownOpen = false;
        this.router.navigate([`dashboard/profile/`, userName]);
    }
    
    items: SidebarItem[] = [
        { name: "Schedule", icon: "tuiIconCalendarLarge", route: "schedule" },
        { name: "Employees", icon: "tuiIconUsersLarge", route: "employees" },
        { name: "Statistics", icon: "tuiIconTrelloLarge", route: "statistics" },
        { name: "Settings", icon: "tuiIconSettingsLarge", route: "settings" }
    ];

    ngOnDestroy(){
        this.routerEventSub.unsubscribe();
    }
}
