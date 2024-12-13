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
import { EditRecordView } from './modules/namespace/views/edit-record/edit-record.view';
import { SettleView } from './modules/namespace/views/settle/settle.view';
import { HomeView } from './modules/home/home.view';
import { HomeGuard } from './services/guards/HomeGuard';
import { AuthGuard } from './services/guards/AuthGuard';

export const appRoutes: Route[] = [
  {
    path: '',
    component: HomeView,
    canActivate: [
      HomeGuard,
    ],
  },
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
        ],
      },
    ],
  },
  {
    path: ':ownerKey',
    canActivate: [ AuthGuard ],
    canActivateChild: [ AuthGuard],
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
        path: 'namespace/:namespaceId/settle',
        component: SettleView,
      },
      {
        path: 'namespace/:namespaceId/edit/:recordId',
        component: EditRecordView,
      },
      {
        path: 'profile',
        component: EditProfileView,
      },
    ],
  },
];
