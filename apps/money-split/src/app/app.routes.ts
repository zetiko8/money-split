import { Route } from '@angular/router';
import { LoginView } from './modules/login/login/login.component';
import { RegisterView } from './modules/login/register/register.component';
import { OwnerRealmView } from './modules/owner-realm/views/realm/owner-realm.view';
import { NewNamespaceView } from './modules/owner-realm/views/new-namespace/new-namespace.view';
import { NamespaceView } from './modules/namespace/views/namespace.view';
import { InvitationView } from './modules/invitation/views/invitation/invitation.view';

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
                component: InvitationView,
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
        ],
    },
];
