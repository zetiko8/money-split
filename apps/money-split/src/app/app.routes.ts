import { Route } from '@angular/router';
import { LoginView } from './modules/login/login/login.component';
import { RegisterView } from './modules/login/register/register.view';
import { OwnerRealmView } from './modules/owner-realm/views/realm/owner-realm.view';
import { NewNamespaceView } from './modules/owner-realm/views/new-namespace/new-namespace.view';
import { NamespaceView } from './modules/namespace/views/namespace/namespace.view';
import { InvitationView } from './modules/invitation/views/invitation/invitation.view';
import { AddExpenseView } from './modules/namespace/views/add-expense/add-expense.view';
import { InviteView } from './modules/namespace/views/invite/invite.view';
import { EditProfileView } from './modules/edit-profile/views/profile/edit-profile.view';
import { InvitationLoginView } from './modules/invitation/views/login/invitation-login.view';
import { InvitationRegisterView } from './modules/invitation/views/register/invitation-register.view';

export const appRoutes: Route[] = [
    {
        path: 'login',
        component: LoginView,
    },
    {
        path: 'register',
        component: RegisterView,
    },
    {
        path: 'invitation',
        children: [
            {
                path: ':invitationKey',
                children: [
                    {
                        path: 'join',
                        component: InvitationView,
                    },
                    {
                        path: 'login',
                        component: InvitationLoginView,
                    },
                    {
                        path: 'register',
                        component: InvitationRegisterView,
                    },
                ]
            }
        ]
    },
    {
        path: ':ownerKey',
        children: [
            {
                path: 'new',
                component: NewNamespaceView,
            },
            {
                path: 'realm',
                component: OwnerRealmView,
            },
            {
                path: 'namespace/:namespaceId',
                component: NamespaceView,
            },
            {
                path: 'namespace/:namespaceId/add',
                component: AddExpenseView,
            },
            {
                path: 'namespace/:namespaceId/invite',
                component: InviteView,
            },
            {
                path: 'profile',
                component: EditProfileView,
            },
        ],
    },
];
