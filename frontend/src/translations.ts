/**
 * Translations for the login frontend
 *
 * To add a new language, add a new key to the translations object
 */

export interface Translations {
  // LoginPage
  welcomeTo: string;
  didYouHaveAccount: string;
  ifPreviouslyUsed: string;
  recoverData: string;
  yesRecoverAccount: string;
  continue: string;
  connectOsmAccount: string;
  connectSameOsm: string;
  goBack: string;
  cancelOnboarding: string;
  settingUpAccount: string;
  accessAllTools: string;

  // ProfilePage
  myProfile: string;
  back: string;
  profileInformation: string;
  pictureUrl: string;
  firstName: string;
  lastName: string;
  email: string;
  emailManagedBy: string;
  language: string;
  connectedToOsm: string;
  saveChanges: string;
  saving: string;
  logOut: string;
  security: string;
  managePasswordPasskeys: string;
  dangerZone: string;
  deleteAccountWarning: string;
  deleteAccount: string;
  deleteConfirm: string;
  deleteComingSoon: string;
  accountCreated: string;
  accountDeleted: string;
  profileUpdated: string;

  // Developer Settings
  developerSettings: string;
  apiAccessTokens: string;
  apiTokenWarning: string;
  generateToken: string;
  regenerateToken: string;
  revokeToken: string;
  tokenCreatedOn: string;
  tokenLastUsed: string;
  tokenNeverUsed: string;
  tokenShownOnce: string;
  tokenCopied: string;
  copyToken: string;
  iSavedIt: string;
  regenerateConfirm: string;
  revokeConfirm: string;
  noTokensYet: string;

  // Data deletion across HOT apps
  dataDeletionTitle: string;
  dataDeletionDescription: string;
  dataDeletionPrivacyPolicy: string;
  dataDeletionRequestButton: string;
  dataDeletionConfirmTitle: string;
  dataDeletionConfirmBody: string;
  dataDeletionConfirmButton: string;
  dataDeletionSubmitting: string;
  dataDeletionSent: string;
  dataDeletionError: string;
  cancel: string;

  // Common
  login: string;
  no_existing_osm_account: string;

  // Teams & Organizations — navigation / layout
  // (optional: missing keys fall back to English via the t() helper)
  hotAccount?: string;
  navProfile?: string;
  navOrganizations?: string;
  navTeams?: string;
  navUsers?: string;
  navAdmin?: string;
  navOrgsToApprove?: string;
  navNotifications?: string;

  // Notifications
  notifications?: string;
  noNotifications?: string;
  markRead?: string;
  markAllRead?: string;
  // {name} is replaced at runtime (t() does not interpolate).
  notifOrgApproved?: string;
  notifOrgRejected?: string;
  notifOrgNameApproved?: string;
  notifOrgNameRejected?: string;

  // Organizations
  organizations?: string;
  organizationsSubtitle?: string;
  requestOrganization?: string;
  requestOrgTitle?: string;
  requestOrgIntro?: string;
  name?: string;
  orgNameHint?: string;
  contactEmail?: string;
  website?: string;
  description?: string;
  submitRequest?: string;
  orgRequestSubmitted?: string;
  noOrganizations?: string;

  // Invitations
  pendingInvitations?: string;
  invitedToJoin?: string;
  accept?: string;
  decline?: string;
  // (the "accepted" toast reuses `inviteAccepted` from the accept-invite page)
  inviteDeclined?: string;
  declineInviteTitle?: string;
  declineInviteConfirm?: string;

  // Teams
  teams?: string;
  teamsSubtitle?: string;
  createTeam?: string;
  createTeamTitle?: string;
  teamCreated?: string;
  memberIdsLabel?: string;
  memberIdsHint?: string;
  noTeams?: string;
  create?: string;

  // Group detail (shared)
  detailsTab?: string;
  membersTab?: string;
  changeName?: string;
  nameChangePending?: string;
  avatarLabel?: string;
  bannerLabel?: string;
  changeBanner?: string;
  changeAvatar?: string;
  detailsSaved?: string;
  publicGroup?: string;
  deleteGroupBtn?: string;
  deleteGroupConfirm?: string;
  deleteTeamTitle?: string;
  deleteOrgTitle?: string;
  teamDeleted?: string;
  orgDeleted?: string;

  // Members
  addMemberByEmail?: string;
  addMemberById?: string;
  hankoUserIdLabel?: string;
  inviteBtn?: string;
  addBtn?: string;
  removeMember?: string;
  leaveGroup?: string;
  removeMemberConfirm?: string;
  removeMemberDetail?: string;
  leaveGroupConfirm?: string;
  leaveGroupDetail?: string;
  transferOwnershipConfirm?: string;
  transferOwnershipDetail?: string;
  transferOwnershipBtn?: string;
  memberSince?: string;
  noMembers?: string;
  sentInvitations?: string;
  cancelInvite?: string;
  cancelInviteConfirm?: string;
  previous?: string;
  next?: string;

  // Member roles
  roleOwner?: string;
  roleManager?: string;
  roleMember?: string;

  // Group statuses
  statusPending?: string;
  statusApproved?: string;
  statusActive?: string;
  statusRejected?: string;

  // Accept invite page
  acceptingInvite?: string;
  inviteAccepted?: string;
  inviteFailed?: string;
  goToGroup?: string;
  noInviteToken?: string;

  // Admin tabs (users / organizations management)
  adminUsersTab?: string;
  adminOrganizationsTab?: string;
  makeAccountManager?: string;
  removeAccountManager?: string;
  approveBtn?: string;
  rejectBtn?: string;
  approveNameBtn?: string;
  rejectNameBtn?: string;

  // Organizations to approve (account area)
  orgsToApprove?: string;
  orgsToApproveNoAccess?: string;
  noPendingOrgs?: string;
  review?: string;
  close?: string;
  rejectReason?: string;
  rejectReasonHint?: string;
  requestedOn?: string;
  requestedBy?: string;
  currentName?: string;
  proposedName?: string;
  orgApproved?: string;
  orgRejected?: string;
  orgNameApproved?: string;
  orgNameRejected?: string;
}

export const translations: Record<string, Translations> = {
  en: {
    welcomeTo: "Welcome to the HOT's",
    didYouHaveAccount: 'Do you already have an account?',
    ifPreviouslyUsed: 'If you have logged in',
    recoverData: 'before, you can recover your data.',
    yesRecoverAccount: 'Recover my existing account',
    continue: 'Continue',
    connectOsmAccount: 'Connect your OpenStreetMap account',
    connectSameOsm:
      'Connect with the same OSM account you used before to recover your',
    goBack: '← Go back',
    cancelOnboarding: 'Cancel',
    settingUpAccount: 'Setting up your account...',
    accessAllTools: 'Access all HOT tools and services',
    myProfile: 'My Profile',
    back: 'Back',
    profileInformation: 'Profile Information',
    pictureUrl: 'Picture URL',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    emailManagedBy: 'Email is managed by your login provider',
    language: 'Language',
    connectedToOsm: 'Connected to OpenStreetMap',
    saveChanges: 'Save Changes',
    saving: 'Saving...',
    logOut: 'Log out',
    security: 'Security',
    managePasswordPasskeys:
      'Manage your password, passkeys, and active sessions.',
    dangerZone: 'Danger Zone',
    deleteAccountWarning:
      'Permanently delete your account and all associated data.',
    deleteAccount: 'Delete Account',
    deleteConfirm:
      'Are you sure you want to delete your account? This action cannot be undone.',
    deleteComingSoon: 'Account deletion will be available soon.',
    accountCreated: 'Account created',
    accountDeleted: 'Your account has been deleted successfully.',
    profileUpdated: 'Profile updated successfully',
    developerSettings: 'Developer Settings',
    apiAccessTokens: 'API Access Tokens',
    apiTokenWarning:
      'Keep these tokens safe. Anyone with a token can access your account in the corresponding app.',
    generateToken: 'Generate Token',
    regenerateToken: 'Regenerate',
    revokeToken: 'Revoke',
    tokenCreatedOn: 'Created on',
    tokenLastUsed: 'Last used',
    tokenNeverUsed: 'Never used',
    tokenShownOnce: 'This token will not be shown again. Copy it now.',
    tokenCopied: 'Token copied!',
    copyToken: 'Copy Token',
    iSavedIt: "I've saved it",
    regenerateConfirm:
      'This will invalidate the previous token immediately. Continue?',
    revokeConfirm: 'This will permanently revoke this token. Continue?',
    noTokensYet: 'No tokens generated yet.',
    dataDeletionTitle: 'Data across HOT apps',
    dataDeletionDescription:
      'Request the permanent removal of your personal data from specific apps or the entire HOT Tech Suite. For more information on how we handle your information, please review our',
    dataDeletionPrivacyPolicy: 'Privacy Policy',
    dataDeletionRequestButton: 'Request data deletion',
    dataDeletionConfirmTitle: 'Request data deletion',
    dataDeletionConfirmBody:
      'We will email HOT admins asking them to remove your data from all HOT apps. They may contact you to coordinate.',
    dataDeletionConfirmButton: 'Send request',
    dataDeletionSubmitting: 'Sending...',
    dataDeletionSent:
      'Request sent. HOT admins will contact you to coordinate.',
    dataDeletionError: 'Failed to send request. Please try again later.',
    cancel: 'Cancel',
    login: 'Login',
    no_existing_osm_account:
      "No existing account found for your OSM user. Please select 'Continue' to create a new account.",
    hotAccount: 'HOT Account',
    navProfile: 'Profile',
    navOrganizations: 'Organizations',
    navTeams: 'Teams',
    navUsers: 'Users',
    navAdmin: 'Admin',
    navOrgsToApprove: 'Organizations to approve',
    navNotifications: 'Notifications',
    notifications: 'Notifications',
    noNotifications: 'You have no notifications.',
    markRead: 'Mark as read',
    markAllRead: 'Mark all as read',
    notifOrgApproved: 'Your organization {name} was approved.',
    notifOrgRejected: 'Your organization {name} was not approved.',
    notifOrgNameApproved: 'Your name change to {name} was approved.',
    notifOrgNameRejected: 'Your name change to {name} was not approved.',
    organizations: 'Organizations',
    organizationsSubtitle: 'Official organizations you belong to',
    requestOrganization: 'Request organization',
    requestOrgTitle: 'Request a new organization',
    requestOrgIntro:
      'New organizations require manager approval before activation. Once approved, you can invite team members and share projects.',
    name: 'Name',
    orgNameHint:
      "This is your organization's public name. Changing it after approval requires a review.",
    contactEmail: 'Contact email',
    website: 'Website',
    description: 'Description',
    submitRequest: 'Submit request',
    orgRequestSubmitted:
      'Your organization request was submitted and is pending approval.',
    noOrganizations: "You don't belong to any organizations yet.",
    pendingInvitations: 'Pending invitations',
    invitedToJoin: "You've been invited to join as a",
    accept: 'Accept',
    decline: 'Decline',
    inviteDeclined: 'Invitation declined.',
    declineInviteTitle: 'Decline this invitation?',
    declineInviteConfirm:
      "You won't join this organization. A manager will have to invite you again.",
    teams: 'Teams',
    teamsSubtitle: 'Informal teams you belong to',
    createTeam: 'Create team',
    createTeamTitle: 'Create a new team',
    teamCreated: 'Team created.',
    memberIdsLabel: 'Member IDs (optional)',
    memberIdsHint: 'Comma-separated Hanko user IDs',
    noTeams: "You don't belong to any teams yet.",
    create: 'Create',
    detailsTab: 'Details',
    membersTab: 'Members',
    changeName: 'Change name',
    nameChangePending: 'Name change pending approval',
    avatarLabel: 'Avatar',
    bannerLabel: 'Banner',
    changeBanner: 'Change banner',
    changeAvatar: 'Change avatar',
    detailsSaved: 'Changes saved.',
    publicGroup: 'Public',
    deleteGroupBtn: 'Delete',
    deleteGroupConfirm: 'Are you sure? This cannot be undone.',
    deleteTeamTitle: 'Delete team?',
    deleteOrgTitle: 'Delete organization?',
    teamDeleted: 'Team deleted.',
    orgDeleted: 'Organization deleted.',
    addMemberByEmail: 'Invite by email',
    addMemberById: 'Add member by ID',
    hankoUserIdLabel: 'Hanko user ID',
    inviteBtn: 'Invite',
    addBtn: 'Add',
    removeMember: 'Remove',
    leaveGroup: 'Leave',
    removeMemberConfirm: 'Remove this member?',
    removeMemberDetail:
      'They lose access to this group. You can add them back later.',
    leaveGroupConfirm: 'Leave this group?',
    leaveGroupDetail:
      'You lose access to this group. An owner or manager has to add you back.',
    transferOwnershipConfirm: 'Transfer ownership to this member?',
    transferOwnershipDetail:
      'They become the owner of this group and you become a manager.',
    transferOwnershipBtn: 'Transfer ownership',
    memberSince: 'Member since',
    noMembers: 'No members yet.',
    sentInvitations: 'Pending invitations',
    cancelInvite: 'Cancel',
    cancelInviteConfirm: 'Cancel this invitation?',
    previous: 'Previous',
    next: 'Next',
    roleOwner: 'Owner',
    roleManager: 'Manager',
    roleMember: 'Member',
    statusPending: 'Pending',
    statusApproved: 'Approved',
    statusActive: 'Active',
    statusRejected: 'Rejected',
    acceptingInvite: 'Accepting invitation...',
    inviteAccepted: 'Invitation accepted!',
    inviteFailed: 'Could not accept the invitation.',
    goToGroup: 'Go to organizations',
    noInviteToken: 'No invitation token provided.',
    adminUsersTab: 'Users',
    adminOrganizationsTab: 'Organizations',
    makeAccountManager: 'Make account manager',
    removeAccountManager: 'Remove account manager',
    approveBtn: 'Approve',
    rejectBtn: 'Reject',
    approveNameBtn: 'Approve name',
    rejectNameBtn: 'Reject name',
    orgsToApprove: 'Organizations to approve',
    orgsToApproveNoAccess:
      "You don't have permission to review organization requests.",
    noPendingOrgs: 'No organizations awaiting approval.',
    review: 'Review',
    close: 'Close',
    rejectReason: 'Reason for rejection',
    rejectReasonHint: 'Optional — shared with the requester',
    requestedOn: 'Requested',
    requestedBy: 'Requested by',
    currentName: 'Current name',
    proposedName: 'Proposed name',
    orgApproved: 'Organization approved.',
    orgRejected: 'Organization rejected.',
    orgNameApproved: 'Name change approved.',
    orgNameRejected: 'Name change rejected.',
  },
  es: {
    welcomeTo: "Bienvenido a HOT's",
    didYouHaveAccount: '¿Ya tienes una cuenta existente?',
    ifPreviouslyUsed: 'Si has iniciado sesión',
    recoverData: 'antes, puedes recuperar tus datos.',
    yesRecoverAccount: 'Recuperar mi cuenta existente',
    continue: 'Continuar',
    connectOsmAccount: 'Conecta tu cuenta de OpenStreetMap',
    connectSameOsm:
      'Conéctate con la misma cuenta OSM que usaste antes para recuperar tu',
    goBack: '← Volver',
    cancelOnboarding: 'Cancelar',
    settingUpAccount: 'Configurando tu cuenta...',
    accessAllTools: 'Accede a todas las herramientas y servicios de HOT',
    myProfile: 'Mi Perfil',
    back: 'Volver',
    profileInformation: 'Información del Perfil',
    pictureUrl: 'URL de imagen',
    firstName: 'Nombre',
    lastName: 'Apellido',
    email: 'Correo electrónico',
    emailManagedBy:
      'El correo es administrado por tu proveedor de inicio de sesión',
    language: 'Idioma',
    connectedToOsm: 'Conectado a OpenStreetMap',
    saveChanges: 'Guardar Cambios',
    saving: 'Guardando...',
    logOut: 'Cerrar sesión',
    security: 'Seguridad',
    managePasswordPasskeys:
      'Administra tu contraseña, passkeys y sesiones activas.',
    dangerZone: 'Zona de Peligro',
    deleteAccountWarning:
      'Elimina permanentemente tu cuenta y todos los datos asociados.',
    deleteAccount: 'Eliminar Cuenta',
    deleteConfirm:
      '¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.',
    deleteComingSoon: 'La eliminación de cuenta estará disponible pronto.',
    accountCreated: 'Cuenta creada',
    accountDeleted: 'Tu cuenta ha sido eliminada exitosamente.',
    profileUpdated: 'Perfil actualizado exitosamente',
    developerSettings: 'Configuración de Desarrollador',
    apiAccessTokens: 'Tokens de acceso API',
    apiTokenWarning:
      'Mantén estos tokens seguros. Cualquiera con un token puede acceder a tu cuenta en la aplicación correspondiente.',
    generateToken: 'Generar Token',
    regenerateToken: 'Regenerar',
    revokeToken: 'Revocar',
    tokenCreatedOn: 'Creado el',
    tokenLastUsed: 'Último uso',
    tokenNeverUsed: 'Nunca usado',
    tokenShownOnce: 'Este token no se mostrará de nuevo. Cópialo ahora.',
    tokenCopied: '¡Token copiado!',
    copyToken: 'Copiar Token',
    iSavedIt: 'Ya lo guardé',
    regenerateConfirm:
      'Esto invalidará el token anterior inmediatamente. ¿Continuar?',
    revokeConfirm: 'Esto revocará permanentemente este token. ¿Continuar?',
    noTokensYet: 'No hay tokens generados aún.',
    dataDeletionTitle: 'Datos en las apps de HOT',
    dataDeletionDescription:
      'Solicitá la eliminación permanente de tus datos personales de apps específicas o de todo el HOT Tech Suite. Para más información sobre cómo manejamos tu información, consultá nuestra',
    dataDeletionPrivacyPolicy: 'Política de Privacidad',
    dataDeletionRequestButton: 'Solicitar eliminación de datos',
    dataDeletionConfirmTitle: 'Solicitar eliminación de datos',
    dataDeletionConfirmBody:
      'Enviaremos un email a los administradores de HOT pidiendo que eliminen tus datos de todas las apps. Es posible que se contacten con vos para coordinar.',
    dataDeletionConfirmButton: 'Enviar solicitud',
    dataDeletionSubmitting: 'Enviando...',
    dataDeletionSent:
      'Tu solicitud fue enviada. Los administradores de HOT te contactarán si necesitan más información.',
    dataDeletionError:
      'No se pudo enviar la solicitud. Por favor intentá de nuevo.',
    cancel: 'Cancelar',
    login: 'Inicio de sesión',
    no_existing_osm_account:
      "No se encontró una cuenta existente para tu usuario de OSM. Por favor selecciona 'Continuar' para crear una nueva cuenta.",
    hotAccount: 'Cuenta HOT',
    navProfile: 'Perfil',
    navOrganizations: 'Organizaciones',
    navTeams: 'Equipos',
    navUsers: 'Usuarios',
    navAdmin: 'Admin',
    navOrgsToApprove: 'Organizaciones por aprobar',
    navNotifications: 'Notificaciones',
    notifications: 'Notificaciones',
    noNotifications: 'No tienes notificaciones.',
    markRead: 'Marcar como leída',
    markAllRead: 'Marcar todas como leídas',
    notifOrgApproved: 'Tu organización {name} fue aprobada.',
    notifOrgRejected: 'Tu organización {name} no fue aprobada.',
    notifOrgNameApproved: 'Tu cambio de nombre a {name} fue aprobado.',
    notifOrgNameRejected: 'Tu cambio de nombre a {name} no fue aprobado.',
    organizations: 'Organizaciones',
    organizationsSubtitle: 'Organizaciones oficiales a las que perteneces',
    requestOrganization: 'Solicitar organización',
    requestOrgTitle: 'Solicitar una nueva organización',
    requestOrgIntro:
      'Las nuevas organizaciones requieren la aprobación de un gestor antes de activarse. Una vez aprobada, podrás invitar a miembros del equipo y compartir proyectos.',
    name: 'Nombre',
    orgNameHint:
      'Este es el nombre público de tu organización. Cambiarlo después de la aprobación requiere una revisión.',
    contactEmail: 'Correo de contacto',
    website: 'Sitio web',
    description: 'Descripción',
    submitRequest: 'Enviar solicitud',
    orgRequestSubmitted:
      'Tu solicitud de organización fue enviada y está pendiente de aprobación.',
    noOrganizations: 'Todavía no perteneces a ninguna organización.',
    pendingInvitations: 'Invitaciones pendientes',
    invitedToJoin: 'Te invitaron a unirte como',
    accept: 'Aceptar',
    decline: 'Rechazar',
    inviteDeclined: 'Invitación rechazada.',
    declineInviteTitle: '¿Rechazar esta invitación?',
    declineInviteConfirm:
      'No te unirás a esta organización. Un gestor tendrá que invitarte de nuevo.',
    teams: 'Equipos',
    teamsSubtitle: 'Equipos informales a los que perteneces',
    createTeam: 'Crear equipo',
    createTeamTitle: 'Crear un nuevo equipo',
    teamCreated: 'Equipo creado.',
    memberIdsLabel: 'IDs de miembros (opcional)',
    memberIdsHint: 'IDs de usuario de Hanko separados por comas',
    noTeams: 'Todavía no perteneces a ningún equipo.',
    create: 'Crear',
    detailsTab: 'Detalles',
    membersTab: 'Miembros',
    changeName: 'Cambiar nombre',
    nameChangePending: 'Cambio de nombre pendiente de aprobación',
    avatarLabel: 'Avatar',
    bannerLabel: 'Banner',
    changeBanner: 'Cambiar banner',
    changeAvatar: 'Cambiar avatar',
    detailsSaved: 'Cambios guardados.',
    publicGroup: 'Público',
    deleteGroupBtn: 'Eliminar',
    deleteGroupConfirm: '¿Estás seguro? Esto no se puede deshacer.',
    deleteTeamTitle: '¿Eliminar equipo?',
    deleteOrgTitle: '¿Eliminar organización?',
    teamDeleted: 'Equipo eliminado.',
    orgDeleted: 'Organización eliminada.',
    addMemberByEmail: 'Invitar por email',
    addMemberById: 'Agregar miembro por ID',
    hankoUserIdLabel: 'ID de usuario Hanko',
    inviteBtn: 'Invitar',
    addBtn: 'Agregar',
    removeMember: 'Quitar',
    leaveGroup: 'Salir',
    removeMemberConfirm: '¿Quitar a este miembro?',
    removeMemberDetail:
      'Perderá el acceso a este grupo. Puedes volver a agregarlo más tarde.',
    leaveGroupConfirm: '¿Salir de este grupo?',
    leaveGroupDetail:
      'Perderás el acceso a este grupo. Un propietario o gestor tendrá que volver a agregarte.',
    transferOwnershipConfirm: '¿Transferir la propiedad a este miembro?',
    transferOwnershipDetail:
      'Pasará a ser propietario de este grupo y tú pasarás a ser gestor.',
    transferOwnershipBtn: 'Transferir la propiedad',
    memberSince: 'Miembro desde',
    noMembers: 'Todavía no hay miembros.',
    sentInvitations: 'Invitaciones enviadas',
    cancelInvite: 'Cancelar',
    cancelInviteConfirm: '¿Cancelar esta invitación?',
    previous: 'Anterior',
    next: 'Siguiente',
    roleOwner: 'Propietario',
    roleManager: 'Gestor',
    roleMember: 'Miembro',
    statusPending: 'Pendiente',
    statusApproved: 'Aprobada',
    statusActive: 'Activa',
    statusRejected: 'Rechazada',
    acceptingInvite: 'Aceptando invitación...',
    inviteAccepted: '¡Invitación aceptada!',
    inviteFailed: 'No se pudo aceptar la invitación.',
    goToGroup: 'Ir a organizaciones',
    noInviteToken: 'No se proporcionó un token de invitación.',
    adminUsersTab: 'Usuarios',
    adminOrganizationsTab: 'Organizaciones',
    makeAccountManager: 'Hacer gestor de cuentas',
    removeAccountManager: 'Quitar gestor de cuentas',
    orgsToApprove: 'Organizaciones por aprobar',
    orgsToApproveNoAccess:
      'No tienes permiso para revisar solicitudes de organizaciones.',
    noPendingOrgs: 'No hay organizaciones pendientes de aprobación.',
    review: 'Revisar',
    close: 'Cerrar',
    rejectReason: 'Motivo del rechazo',
    rejectReasonHint: 'Opcional — se comparte con quien lo solicitó',
    requestedOn: 'Solicitada',
    requestedBy: 'Solicitada por',
    currentName: 'Nombre actual',
    proposedName: 'Nombre propuesto',
    orgApproved: 'Organización aprobada.',
    orgRejected: 'Organización rechazada.',
    orgNameApproved: 'Cambio de nombre aprobado.',
    orgNameRejected: 'Cambio de nombre rechazado.',
    approveBtn: 'Aprobar',
    rejectBtn: 'Rechazar',
    approveNameBtn: 'Aprobar nombre',
    rejectNameBtn: 'Rechazar nombre',
  },
  fr: {
    welcomeTo: "Bienvenue sur HOT's",
    didYouHaveAccount: 'Avez-vous déjà un compte ?',
    ifPreviouslyUsed: 'Si vous vous êtes déjà connecté',
    recoverData: 'avant, vous pouvez récupérer vos données.',
    yesRecoverAccount: 'Récupérer mon compte existant',
    continue: 'Continuer',
    connectOsmAccount: 'Connectez votre compte OpenStreetMap',
    connectSameOsm:
      'Connectez-vous avec le même compte OSM que vous avez utilisé auparavant pour récupérer votre',
    goBack: '← Retour',
    cancelOnboarding: 'Annuler',
    settingUpAccount: 'Configuration de votre compte...',
    accessAllTools: 'Accédez à tous les outils et services HOT',
    myProfile: 'Mon Profil',
    back: 'Retour',
    profileInformation: 'Informations du Profil',
    pictureUrl: "URL de l'image",
    firstName: 'Prénom',
    lastName: 'Nom',
    email: 'Email',
    emailManagedBy: "L'email est géré par votre fournisseur de connexion",
    language: 'Langue',
    connectedToOsm: 'Connecté à OpenStreetMap',
    saveChanges: 'Enregistrer les Modifications',
    saving: 'Enregistrement...',
    logOut: 'Se déconnecter',
    security: 'Sécurité',
    managePasswordPasskeys:
      'Gérez votre mot de passe, passkeys et sessions actives.',
    dangerZone: 'Zone Dangereuse',
    deleteAccountWarning:
      'Supprimer définitivement votre compte et toutes les données associées.',
    deleteAccount: 'Supprimer le Compte',
    deleteConfirm:
      'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action ne peut pas être annulée.',
    deleteComingSoon: 'La suppression de compte sera bientôt disponible.',
    accountCreated: 'Compte créé',
    accountDeleted: 'Votre compte a été supprimé avec succès.',
    profileUpdated: 'Profil mis à jour avec succès',
    developerSettings: 'Paramètres Développeur',
    apiAccessTokens: "Tokens d'accès API",
    apiTokenWarning:
      "Gardez ces tokens en sécurité. Toute personne possédant un token peut accéder à votre compte dans l'application correspondante.",
    generateToken: 'Générer un Token',
    regenerateToken: 'Régénérer',
    revokeToken: 'Révoquer',
    tokenCreatedOn: 'Créé le',
    tokenLastUsed: 'Dernière utilisation',
    tokenNeverUsed: 'Jamais utilisé',
    tokenShownOnce: 'Ce token ne sera plus affiché. Copiez-le maintenant.',
    tokenCopied: 'Token copié !',
    copyToken: 'Copier le Token',
    iSavedIt: "Je l'ai sauvegardé",
    regenerateConfirm:
      'Cela invalidera immédiatement le token précédent. Continuer ?',
    revokeConfirm: 'Cela révoquera définitivement ce token. Continuer ?',
    noTokensYet: "Aucun token généré pour l'instant.",
    dataDeletionTitle: 'Données sur les apps HOT',
    dataDeletionDescription:
      "Demandez la suppression définitive de vos données personnelles d'apps spécifiques ou de l'ensemble de la HOT Tech Suite. Pour plus d'informations sur la façon dont nous traitons vos données, consultez notre",
    dataDeletionPrivacyPolicy: 'Politique de confidentialité',
    dataDeletionRequestButton: 'Demander la suppression des données',
    dataDeletionConfirmTitle: 'Demander la suppression des données',
    dataDeletionConfirmBody:
      'Nous enverrons un email aux administrateurs de HOT pour leur demander de supprimer vos données de toutes les apps. Ils pourraient vous contacter pour coordonner.',
    dataDeletionConfirmButton: 'Envoyer la demande',
    dataDeletionSubmitting: 'Envoi en cours...',
    dataDeletionSent:
      'Votre demande a été envoyée. Les administrateurs de HOT vous contacteront si nécessaire.',
    dataDeletionError: "Impossible d'envoyer la demande. Veuillez réessayer.",
    cancel: 'Annuler',
    login: 'Connexion',
    no_existing_osm_account:
      "Aucun compte existant trouvé pour votre utilisateur OSM. Veuillez sélectionner 'Continuer' pour créer un nouveau compte.",
    hotAccount: 'Compte HOT',
    navProfile: 'Profil',
    navOrganizations: 'Organisations',
    navTeams: 'Équipes',
    navUsers: 'Utilisateurs',
    navAdmin: 'Admin',
    navOrgsToApprove: 'Organisations à approuver',
    navNotifications: 'Notifications',
    notifications: 'Notifications',
    noNotifications: "Vous n'avez aucune notification.",
    markRead: 'Marquer comme lu',
    markAllRead: 'Tout marquer comme lu',
    notifOrgApproved: 'Votre organisation {name} a été approuvée.',
    notifOrgRejected: "Votre organisation {name} n'a pas été approuvée.",
    notifOrgNameApproved: 'Votre changement de nom en {name} a été approuvé.',
    notifOrgNameRejected:
      "Votre changement de nom en {name} n'a pas été approuvé.",
    organizations: 'Organisations',
    organizationsSubtitle: 'Organisations officielles dont vous faites partie',
    requestOrganization: 'Demander une organisation',
    requestOrgTitle: 'Demander une nouvelle organisation',
    requestOrgIntro:
      "Les nouvelles organisations doivent être approuvées par un gestionnaire avant d'être activées. Une fois approuvée, vous pourrez inviter des membres et partager des projets.",
    name: 'Nom',
    orgNameHint:
      "Il s'agit du nom public de votre organisation. Le modifier après l'approbation nécessite un examen.",
    contactEmail: 'Email de contact',
    website: 'Site web',
    description: 'Description',
    submitRequest: 'Envoyer la demande',
    orgRequestSubmitted:
      "Votre demande d'organisation a été envoyée et est en attente d'approbation.",
    noOrganizations:
      "Vous ne faites partie d'aucune organisation pour l'instant.",
    pendingInvitations: 'Invitations en attente',
    invitedToJoin: 'Vous avez été invité à rejoindre en tant que',
    accept: 'Accepter',
    decline: 'Refuser',
    inviteDeclined: 'Invitation refusée.',
    declineInviteTitle: 'Refuser cette invitation ?',
    declineInviteConfirm:
      'Vous ne rejoindrez pas cette organisation. Un gestionnaire devra vous inviter à nouveau.',
    teams: 'Équipes',
    teamsSubtitle: 'Équipes informelles dont vous faites partie',
    createTeam: 'Créer une équipe',
    createTeamTitle: 'Créer une nouvelle équipe',
    teamCreated: 'Équipe créée.',
    memberIdsLabel: 'IDs des membres (facultatif)',
    memberIdsHint: "IDs d'utilisateur Hanko séparés par des virgules",
    noTeams: "Vous ne faites partie d'aucune équipe pour l'instant.",
    create: 'Créer',
    detailsTab: 'Détails',
    membersTab: 'Membres',
    changeName: 'Changer le nom',
    nameChangePending: "Changement de nom en attente d'approbation",
    avatarLabel: 'Avatar',
    bannerLabel: 'Bannière',
    changeBanner: 'Changer la bannière',
    changeAvatar: "Changer l'avatar",
    detailsSaved: 'Modifications enregistrées.',
    publicGroup: 'Public',
    deleteGroupBtn: 'Supprimer',
    deleteGroupConfirm: 'Êtes-vous sûr ? Cette action est irréversible.',
    deleteTeamTitle: "Supprimer l'équipe ?",
    deleteOrgTitle: "Supprimer l'organisation ?",
    teamDeleted: 'Équipe supprimée.',
    orgDeleted: 'Organisation supprimée.',
    addMemberByEmail: 'Inviter par email',
    addMemberById: 'Ajouter un membre par ID',
    hankoUserIdLabel: "ID d'utilisateur Hanko",
    inviteBtn: 'Inviter',
    addBtn: 'Ajouter',
    removeMember: 'Retirer',
    leaveGroup: 'Quitter',
    removeMemberConfirm: 'Retirer ce membre ?',
    removeMemberDetail:
      "Il perdra l'accès à ce groupe. Vous pourrez l'ajouter à nouveau plus tard.",
    leaveGroupConfirm: 'Quitter ce groupe ?',
    leaveGroupDetail:
      "Vous perdrez l'accès à ce groupe. Un propriétaire ou un gestionnaire devra vous ajouter à nouveau.",
    transferOwnershipConfirm: 'Transférer la propriété à ce membre ?',
    transferOwnershipDetail:
      'Il deviendra propriétaire de ce groupe et vous deviendrez gestionnaire.',
    transferOwnershipBtn: 'Transférer la propriété',
    memberSince: 'Membre depuis',
    noMembers: "Aucun membre pour l'instant.",
    sentInvitations: 'Invitations envoyées',
    cancelInvite: 'Annuler',
    cancelInviteConfirm: 'Annuler cette invitation ?',
    previous: 'Précédent',
    next: 'Suivant',
    roleOwner: 'Propriétaire',
    roleManager: 'Gestionnaire',
    roleMember: 'Membre',
    statusPending: 'En attente',
    statusApproved: 'Approuvée',
    statusActive: 'Active',
    statusRejected: 'Rejetée',
    acceptingInvite: "Acceptation de l'invitation...",
    inviteAccepted: 'Invitation acceptée !',
    inviteFailed: "Impossible d'accepter l'invitation.",
    goToGroup: 'Aller aux organisations',
    noInviteToken: "Aucun jeton d'invitation fourni.",
    adminUsersTab: 'Utilisateurs',
    adminOrganizationsTab: 'Organisations',
    makeAccountManager: 'Nommer gestionnaire de comptes',
    removeAccountManager: 'Retirer gestionnaire de comptes',
    approveBtn: 'Approuver',
    rejectBtn: 'Rejeter',
    approveNameBtn: 'Approuver le nom',
    rejectNameBtn: 'Rejeter le nom',
    orgsToApprove: 'Organisations à approuver',
    orgsToApproveNoAccess:
      "Vous n'avez pas la permission d'examiner les demandes d'organisation.",
    noPendingOrgs: "Aucune organisation en attente d'approbation.",
    review: 'Examiner',
    close: 'Fermer',
    rejectReason: 'Motif du rejet',
    rejectReasonHint: 'Facultatif — partagé avec le demandeur',
    requestedOn: 'Demandée le',
    requestedBy: 'Demandée par',
    currentName: 'Nom actuel',
    proposedName: 'Nom proposé',
    orgApproved: 'Organisation approuvée.',
    orgRejected: 'Organisation rejetée.',
    orgNameApproved: 'Changement de nom approuvé.',
    orgNameRejected: 'Changement de nom rejeté.',
  },
  pt: {
    welcomeTo: "Bem-vindo ao HOT's",
    didYouHaveAccount: 'Você já tem uma conta?',
    ifPreviouslyUsed: 'Se você já fez login',
    recoverData: 'antes, você pode recuperar seus dados.',
    yesRecoverAccount: 'Recuperar minha conta existente',
    continue: 'Continuar',
    connectOsmAccount: 'Conecte sua conta OpenStreetMap',
    connectSameOsm:
      'Conecte-se com a mesma conta OSM que você usou antes para recuperar seu',
    goBack: '← Voltar',
    cancelOnboarding: 'Cancelar',
    settingUpAccount: 'Configurando sua conta...',
    accessAllTools: 'Acesse todas as ferramentas e serviços HOT',
    myProfile: 'Meu Perfil',
    back: 'Voltar',
    profileInformation: 'Informações do Perfil',
    pictureUrl: 'URL da imagem',
    firstName: 'Nome',
    lastName: 'Sobrenome',
    email: 'E-mail',
    emailManagedBy: 'O e-mail é gerenciado pelo seu provedor de login',
    language: 'Idioma',
    connectedToOsm: 'Conectado ao OpenStreetMap',
    saveChanges: 'Salvar Alterações',
    saving: 'Salvando...',
    logOut: 'Sair',
    security: 'Segurança',
    managePasswordPasskeys: 'Gerencie sua senha, passkeys e sessões ativas.',
    dangerZone: 'Zona de Perigo',
    deleteAccountWarning:
      'Excluir permanentemente sua conta e todos os dados associados.',
    deleteAccount: 'Excluir Conta',
    deleteConfirm:
      'Tem certeza de que deseja excluir sua conta? Esta ação não pode ser desfeita.',
    deleteComingSoon: 'A exclusão de conta estará disponível em breve.',
    accountCreated: 'Conta criada',
    accountDeleted: 'Sua conta foi excluída com sucesso.',
    profileUpdated: 'Perfil atualizado com sucesso',
    developerSettings: 'Configurações de Desenvolvedor',
    apiAccessTokens: 'Tokens de acesso API',
    apiTokenWarning:
      'Mantenha estes tokens seguros. Qualquer pessoa com um token pode acessar sua conta no aplicativo correspondente.',
    generateToken: 'Gerar Token',
    regenerateToken: 'Regenerar',
    revokeToken: 'Revogar',
    tokenCreatedOn: 'Criado em',
    tokenLastUsed: 'Último uso',
    tokenNeverUsed: 'Nunca usado',
    tokenShownOnce: 'Este token não será mostrado novamente. Copie-o agora.',
    tokenCopied: 'Token copiado!',
    copyToken: 'Copiar Token',
    iSavedIt: 'Já salvei',
    regenerateConfirm:
      'Isso invalidará o token anterior imediatamente. Continuar?',
    revokeConfirm: 'Isso revogará permanentemente este token. Continuar?',
    noTokensYet: 'Nenhum token gerado ainda.',
    dataDeletionTitle: 'Dados nos apps HOT',
    dataDeletionDescription:
      'Solicite a remoção permanente dos seus dados pessoais de apps específicos ou de todo o HOT Tech Suite. Para mais informações sobre como tratamos seus dados, consulte nossa',
    dataDeletionPrivacyPolicy: 'Política de Privacidade',
    dataDeletionRequestButton: 'Solicitar exclusão de dados',
    dataDeletionConfirmTitle: 'Solicitar exclusão de dados',
    dataDeletionConfirmBody:
      'Enviaremos um email aos administradores do HOT pedindo que removam seus dados de todos os apps. Eles podem entrar em contato para coordenar.',
    dataDeletionConfirmButton: 'Enviar solicitação',
    dataDeletionSubmitting: 'Enviando...',
    dataDeletionSent:
      'Sua solicitação foi enviada. Os administradores do HOT entrarão em contato se necessário.',
    dataDeletionError:
      'Não foi possível enviar a solicitação. Por favor tente novamente.',
    cancel: 'Cancelar',
    login: 'Login',
    no_existing_osm_account:
      "Nenhuma conta existente encontrada para o seu usuário OSM. Por favor selecione 'Continuar' para criar uma nova conta.",
    hotAccount: 'Conta HOT',
    navProfile: 'Perfil',
    navOrganizations: 'Organizações',
    navTeams: 'Equipes',
    navUsers: 'Usuários',
    navAdmin: 'Admin',
    navOrgsToApprove: 'Organizações para aprovar',
    navNotifications: 'Notificações',
    notifications: 'Notificações',
    noNotifications: 'Você não tem notificações.',
    markRead: 'Marcar como lida',
    markAllRead: 'Marcar todas como lidas',
    notifOrgApproved: 'Sua organização {name} foi aprovada.',
    notifOrgRejected: 'Sua organização {name} não foi aprovada.',
    notifOrgNameApproved: 'Sua alteração de nome para {name} foi aprovada.',
    notifOrgNameRejected: 'Sua alteração de nome para {name} não foi aprovada.',
    organizations: 'Organizações',
    organizationsSubtitle: 'Organizações oficiais às quais você pertence',
    requestOrganization: 'Solicitar organização',
    requestOrgTitle: 'Solicitar uma nova organização',
    requestOrgIntro:
      'Novas organizações precisam da aprovação de um gestor antes de serem ativadas. Após a aprovação, você poderá convidar membros da equipe e compartilhar projetos.',
    name: 'Nome',
    orgNameHint:
      'Este é o nome público da sua organização. Alterá-lo após a aprovação exige uma revisão.',
    contactEmail: 'E-mail de contato',
    website: 'Site',
    description: 'Descrição',
    submitRequest: 'Enviar solicitação',
    orgRequestSubmitted:
      'Sua solicitação de organização foi enviada e está pendente de aprovação.',
    noOrganizations: 'Você ainda não pertence a nenhuma organização.',
    pendingInvitations: 'Convites pendentes',
    invitedToJoin: 'Você foi convidado para entrar como',
    accept: 'Aceitar',
    decline: 'Recusar',
    inviteDeclined: 'Convite recusado.',
    declineInviteTitle: 'Recusar este convite?',
    declineInviteConfirm:
      'Você não entrará nesta organização. Um gerente terá que convidá-lo novamente.',
    teams: 'Equipes',
    teamsSubtitle: 'Equipes informais às quais você pertence',
    createTeam: 'Criar equipe',
    createTeamTitle: 'Criar uma nova equipe',
    teamCreated: 'Equipe criada.',
    memberIdsLabel: 'IDs de membros (opcional)',
    memberIdsHint: 'IDs de usuário Hanko separados por vírgulas',
    noTeams: 'Você ainda não pertence a nenhuma equipe.',
    create: 'Criar',
    detailsTab: 'Detalhes',
    membersTab: 'Membros',
    changeName: 'Alterar nome',
    nameChangePending: 'Alteração de nome pendente de aprovação',
    avatarLabel: 'Avatar',
    bannerLabel: 'Banner',
    changeBanner: 'Alterar banner',
    changeAvatar: 'Alterar avatar',
    detailsSaved: 'Alterações salvas.',
    publicGroup: 'Público',
    deleteGroupBtn: 'Excluir',
    deleteGroupConfirm: 'Tem certeza? Isso não pode ser desfeito.',
    deleteTeamTitle: 'Excluir equipe?',
    deleteOrgTitle: 'Excluir organização?',
    teamDeleted: 'Equipe excluída.',
    orgDeleted: 'Organização excluída.',
    addMemberByEmail: 'Convidar por e-mail',
    addMemberById: 'Adicionar membro por ID',
    hankoUserIdLabel: 'ID de usuário Hanko',
    inviteBtn: 'Convidar',
    addBtn: 'Adicionar',
    removeMember: 'Remover',
    leaveGroup: 'Sair',
    removeMemberConfirm: 'Remover este membro?',
    removeMemberDetail:
      'Ele perderá o acesso a este grupo. Você pode adicioná-lo novamente mais tarde.',
    leaveGroupConfirm: 'Sair deste grupo?',
    leaveGroupDetail:
      'Você perderá o acesso a este grupo. Um proprietário ou gerente terá que adicioná-lo novamente.',
    transferOwnershipConfirm: 'Transferir a propriedade para este membro?',
    transferOwnershipDetail:
      'Ele se tornará o proprietário deste grupo e você se tornará gerente.',
    transferOwnershipBtn: 'Transferir a propriedade',
    memberSince: 'Membro desde',
    noMembers: 'Ainda não há membros.',
    sentInvitations: 'Convites enviados',
    cancelInvite: 'Cancelar',
    cancelInviteConfirm: 'Cancelar este convite?',
    previous: 'Anterior',
    next: 'Próximo',
    roleOwner: 'Proprietário',
    roleManager: 'Gerente',
    roleMember: 'Membro',
    statusPending: 'Pendente',
    statusApproved: 'Aprovada',
    statusActive: 'Ativa',
    statusRejected: 'Rejeitada',
    acceptingInvite: 'Aceitando convite...',
    inviteAccepted: 'Convite aceito!',
    inviteFailed: 'Não foi possível aceitar o convite.',
    goToGroup: 'Ir para organizações',
    noInviteToken: 'Nenhum token de convite fornecido.',
    adminUsersTab: 'Usuários',
    adminOrganizationsTab: 'Organizações',
    makeAccountManager: 'Tornar gerente de contas',
    removeAccountManager: 'Remover gerente de contas',
    approveBtn: 'Aprovar',
    rejectBtn: 'Rejeitar',
    approveNameBtn: 'Aprovar nome',
    rejectNameBtn: 'Rejeitar nome',
    orgsToApprove: 'Organizações para aprovar',
    orgsToApproveNoAccess:
      'Você não tem permissão para revisar solicitações de organizações.',
    noPendingOrgs: 'Nenhuma organização aguardando aprovação.',
    review: 'Revisar',
    close: 'Fechar',
    rejectReason: 'Motivo da rejeição',
    rejectReasonHint: 'Opcional — compartilhado com quem solicitou',
    requestedOn: 'Solicitada em',
    requestedBy: 'Solicitada por',
    currentName: 'Nome atual',
    proposedName: 'Nome proposto',
    orgApproved: 'Organização aprovada.',
    orgRejected: 'Organização rejeitada.',
    orgNameApproved: 'Alteração de nome aprovada.',
    orgNameRejected: 'Alteração de nome rejeitada.',
  },
};

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'pt', name: 'Português' },
];
