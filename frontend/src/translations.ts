/**
 * Translations for the login frontend
 * 
 * To add a new language, add a new key to the translations object
 */

export interface Translations {
  // LoginPage
  welcomeTo: string;
  needToSetup: string;
  didYouHaveAccount: string;
  ifPreviouslyUsed: string;
  yesRecoverAccount: string;
  noImNew: string;
  notSure: string;
  connectOsmAccount: string;
  connectSameOsm: string;
  goBack: string;
  settingUpAccount: string;
  accessAllTools: string;
  backToPreviousPage: string;
  poweredBy: string;
  
  // ProfilePage
  myProfile: string;
  backTo: string;
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
  security: string;
  managePasswordPasskeys: string;
  dangerZone: string;
  deleteAccountWarning: string;
  deleteAccount: string;
  deleteConfirm: string;
  deleteComingSoon: string;
  accountCreated: string;
  profileUpdated: string;
  
  // Common
  login: string;
}

export const translations: Record<string, Translations> = {
  en: {
    welcomeTo: "Welcome to",
    needToSetup: "We need to set up your account.",
    didYouHaveAccount: "Did you have an existing",
    ifPreviouslyUsed: "If you previously used",
    yesRecoverAccount: "Yes, recover my account",
    noImNew: "No, I'm new here",
    notSure: 'Not sure? Select "Yes" and we\'ll check for you.',
    connectOsmAccount: "Connect your OpenStreetMap account",
    connectSameOsm: "Connect with the same OSM account you used before to recover your",
    goBack: "← Go back",
    settingUpAccount: "Setting up your account...",
    accessAllTools: "Access all HOT tools and services",
    backToPreviousPage: "Back to previous page",
    poweredBy: "Powered by",
    myProfile: "My Profile",
    backTo: "Back to",
    profileInformation: "Profile Information",
    pictureUrl: "Picture URL",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email",
    emailManagedBy: "Email is managed by your login provider",
    language: "Language",
    connectedToOsm: "Connected to OpenStreetMap",
    saveChanges: "Save Changes",
    saving: "Saving...",
    security: "Security",
    managePasswordPasskeys: "Manage your password, passkeys, and active sessions.",
    dangerZone: "Danger Zone",
    deleteAccountWarning: "Permanently delete your account and all associated data.",
    deleteAccount: "Delete Account",
    deleteConfirm: "Are you sure you want to delete your account? This action cannot be undone.",
    deleteComingSoon: "Account deletion will be available soon.",
    accountCreated: "Account created",
    profileUpdated: "Profile updated successfully",
    login: "Login",
  },
  es: {
    welcomeTo: "Bienvenido a",
    needToSetup: "Necesitamos configurar tu cuenta.",
    didYouHaveAccount: "¿Tenías una cuenta existente de",
    ifPreviouslyUsed: "Si anteriormente usaste",
    yesRecoverAccount: "Sí, recuperar mi cuenta",
    noImNew: "No, soy nuevo aquí",
    notSure: '¿No estás seguro? Selecciona "Sí" y lo verificaremos por ti.',
    connectOsmAccount: "Conecta tu cuenta de OpenStreetMap",
    connectSameOsm: "Conéctate con la misma cuenta OSM que usaste antes para recuperar tu",
    goBack: "← Volver",
    settingUpAccount: "Configurando tu cuenta...",
    accessAllTools: "Accede a todas las herramientas y servicios de HOT",
    backToPreviousPage: "Volver a la página anterior",
    poweredBy: "Desarrollado por",
    myProfile: "Mi Perfil",
    backTo: "Volver a",
    profileInformation: "Información del Perfil",
    pictureUrl: "URL de imagen",
    firstName: "Nombre",
    lastName: "Apellido",
    email: "Correo electrónico",
    emailManagedBy: "El correo es administrado por tu proveedor de inicio de sesión",
    language: "Idioma",
    connectedToOsm: "Conectado a OpenStreetMap",
    saveChanges: "Guardar Cambios",
    saving: "Guardando...",
    security: "Seguridad",
    managePasswordPasskeys: "Administra tu contraseña, passkeys y sesiones activas.",
    dangerZone: "Zona de Peligro",
    deleteAccountWarning: "Elimina permanentemente tu cuenta y todos los datos asociados.",
    deleteAccount: "Eliminar Cuenta",
    deleteConfirm: "¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.",
    deleteComingSoon: "La eliminación de cuenta estará disponible pronto.",
    accountCreated: "Cuenta creada",
    profileUpdated: "Perfil actualizado exitosamente",
    login: "Inicio de sesión",
  },
  fr: {
    welcomeTo: "Bienvenue sur",
    needToSetup: "Nous devons configurer votre compte.",
    didYouHaveAccount: "Aviez-vous un compte existant sur",
    ifPreviouslyUsed: "Si vous avez déjà utilisé",
    yesRecoverAccount: "Oui, récupérer mon compte",
    noImNew: "Non, je suis nouveau",
    notSure: 'Pas sûr ? Sélectionnez "Oui" et nous vérifierons pour vous.',
    connectOsmAccount: "Connectez votre compte OpenStreetMap",
    connectSameOsm: "Connectez-vous avec le même compte OSM que vous avez utilisé auparavant pour récupérer votre",
    goBack: "← Retour",
    settingUpAccount: "Configuration de votre compte...",
    accessAllTools: "Accédez à tous les outils et services HOT",
    backToPreviousPage: "Retour à la page précédente",
    poweredBy: "Propulsé par",
    myProfile: "Mon Profil",
    backTo: "Retour à",
    profileInformation: "Informations du Profil",
    pictureUrl: "URL de l'image",
    firstName: "Prénom",
    lastName: "Nom",
    email: "Email",
    emailManagedBy: "L'email est géré par votre fournisseur de connexion",
    language: "Langue",
    connectedToOsm: "Connecté à OpenStreetMap",
    saveChanges: "Enregistrer les Modifications",
    saving: "Enregistrement...",
    security: "Sécurité",
    managePasswordPasskeys: "Gérez votre mot de passe, passkeys et sessions actives.",
    dangerZone: "Zone Dangereuse",
    deleteAccountWarning: "Supprimer définitivement votre compte et toutes les données associées.",
    deleteAccount: "Supprimer le Compte",
    deleteConfirm: "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action ne peut pas être annulée.",
    deleteComingSoon: "La suppression de compte sera bientôt disponible.",
    accountCreated: "Compte créé",
    profileUpdated: "Profil mis à jour avec succès",
    login: "Connexion",
  },
  pt: {
    welcomeTo: "Bem-vindo ao",
    needToSetup: "Precisamos configurar sua conta.",
    didYouHaveAccount: "Você tinha uma conta existente no",
    ifPreviouslyUsed: "Se você usou anteriormente",
    yesRecoverAccount: "Sim, recuperar minha conta",
    noImNew: "Não, sou novo aqui",
    notSure: 'Não tem certeza? Selecione "Sim" e verificaremos para você.',
    connectOsmAccount: "Conecte sua conta OpenStreetMap",
    connectSameOsm: "Conecte-se com a mesma conta OSM que você usou antes para recuperar seu",
    goBack: "← Voltar",
    settingUpAccount: "Configurando sua conta...",
    accessAllTools: "Acesse todas as ferramentas e serviços HOT",
    backToPreviousPage: "Voltar à página anterior",
    poweredBy: "Desenvolvido por",
    myProfile: "Meu Perfil",
    backTo: "Voltar para",
    profileInformation: "Informações do Perfil",
    pictureUrl: "URL da imagem",
    firstName: "Nome",
    lastName: "Sobrenome",
    email: "E-mail",
    emailManagedBy: "O e-mail é gerenciado pelo seu provedor de login",
    language: "Idioma",
    connectedToOsm: "Conectado ao OpenStreetMap",
    saveChanges: "Salvar Alterações",
    saving: "Salvando...",
    security: "Segurança",
    managePasswordPasskeys: "Gerencie sua senha, passkeys e sessões ativas.",
    dangerZone: "Zona de Perigo",
    deleteAccountWarning: "Excluir permanentemente sua conta e todos os dados associados.",
    deleteAccount: "Excluir Conta",
    deleteConfirm: "Tem certeza de que deseja excluir sua conta? Esta ação não pode ser desfeita.",
    deleteComingSoon: "A exclusão de conta estará disponível em breve.",
    accountCreated: "Conta criada",
    profileUpdated: "Perfil atualizado com sucesso",
    login: "Login",
  },
};

export const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "pt", name: "Português" },
];
