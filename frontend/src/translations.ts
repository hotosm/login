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

  // Common
  login: string;
  no_existing_osm_account: string;
}

export const translations: Record<string, Translations> = {
  en: {
    welcomeTo: "Welcome to the HOT's",
    didYouHaveAccount: "Do you already have an account?",
    ifPreviouslyUsed: "If you have logged in",
    recoverData: "before, you can recover your data.",
    yesRecoverAccount: "Recover my existing account",
    continue: "Continue",
    connectOsmAccount: "Connect your OpenStreetMap account",
    connectSameOsm:
      "Connect with the same OSM account you used before to recover your",
    goBack: "← Go back",
    cancelOnboarding: "Cancel",
    settingUpAccount: "Setting up your account...",
    accessAllTools: "Access all HOT tools and services",
    myProfile: "My Profile",
    back: "Back",
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
    logOut: "Log out",
    security: "Security",
    managePasswordPasskeys:
      "Manage your password, passkeys, and active sessions.",
    dangerZone: "Danger Zone",
    deleteAccountWarning:
      "Permanently delete your account and all associated data.",
    deleteAccount: "Delete Account",
    deleteConfirm:
      "Are you sure you want to delete your account? This action cannot be undone.",
    deleteComingSoon: "Account deletion will be available soon.",
    accountCreated: "Account created",
    accountDeleted: "Your account has been deleted successfully.",
    profileUpdated: "Profile updated successfully",
    developerSettings: "Developer Settings",
    apiAccessTokens: "API Access Tokens",
    apiTokenWarning: "Keep these tokens safe. Anyone with a token can access your account in the corresponding app.",
    generateToken: "Generate Token",
    regenerateToken: "Regenerate",
    revokeToken: "Revoke",
    tokenCreatedOn: "Created on",
    tokenLastUsed: "Last used",
    tokenNeverUsed: "Never used",
    tokenShownOnce: "This token will not be shown again. Copy it now.",
    tokenCopied: "Token copied!",
    copyToken: "Copy Token",
    iSavedIt: "I've saved it",
    regenerateConfirm: "This will invalidate the previous token immediately. Continue?",
    revokeConfirm: "This will permanently revoke this token. Continue?",
    noTokensYet: "No tokens generated yet.",
    login: "Login",
    no_existing_osm_account: "No existing account found for your OSM user. Please select 'Continue' to create a new account.",
  },
  es: {
    welcomeTo: "Bienvenido a HOT's",
    didYouHaveAccount: "¿Ya tienes una cuenta existente?",
    ifPreviouslyUsed: "Si has iniciado sesión",
    recoverData: "antes, puedes recuperar tus datos.",
    yesRecoverAccount: "Recuperar mi cuenta existente",
    continue: "Continuar",
    connectOsmAccount: "Conecta tu cuenta de OpenStreetMap",
    connectSameOsm:
      "Conéctate con la misma cuenta OSM que usaste antes para recuperar tu",
    goBack: "← Volver",
    cancelOnboarding: "Cancelar",
    settingUpAccount: "Configurando tu cuenta...",
    accessAllTools: "Accede a todas las herramientas y servicios de HOT",
    myProfile: "Mi Perfil",
    back: "Volver",
    profileInformation: "Información del Perfil",
    pictureUrl: "URL de imagen",
    firstName: "Nombre",
    lastName: "Apellido",
    email: "Correo electrónico",
    emailManagedBy:
      "El correo es administrado por tu proveedor de inicio de sesión",
    language: "Idioma",
    connectedToOsm: "Conectado a OpenStreetMap",
    saveChanges: "Guardar Cambios",
    saving: "Guardando...",
    logOut: "Cerrar sesión",
    security: "Seguridad",
    managePasswordPasskeys:
      "Administra tu contraseña, passkeys y sesiones activas.",
    dangerZone: "Zona de Peligro",
    deleteAccountWarning:
      "Elimina permanentemente tu cuenta y todos los datos asociados.",
    deleteAccount: "Eliminar Cuenta",
    deleteConfirm:
      "¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.",
    deleteComingSoon: "La eliminación de cuenta estará disponible pronto.",
    accountCreated: "Cuenta creada",
    accountDeleted: "Tu cuenta ha sido eliminada exitosamente.",
    profileUpdated: "Perfil actualizado exitosamente",
    developerSettings: "Configuración de Desarrollador",
    apiAccessTokens: "Tokens de acceso API",
    apiTokenWarning: "Mantén estos tokens seguros. Cualquiera con un token puede acceder a tu cuenta en la aplicación correspondiente.",
    generateToken: "Generar Token",
    regenerateToken: "Regenerar",
    revokeToken: "Revocar",
    tokenCreatedOn: "Creado el",
    tokenLastUsed: "Último uso",
    tokenNeverUsed: "Nunca usado",
    tokenShownOnce: "Este token no se mostrará de nuevo. Cópialo ahora.",
    tokenCopied: "¡Token copiado!",
    copyToken: "Copiar Token",
    iSavedIt: "Ya lo guardé",
    regenerateConfirm: "Esto invalidará el token anterior inmediatamente. ¿Continuar?",
    revokeConfirm: "Esto revocará permanentemente este token. ¿Continuar?",
    noTokensYet: "No hay tokens generados aún.",
    login: "Inicio de sesión",
    no_existing_osm_account: "No se encontró una cuenta existente para tu usuario de OSM. Por favor selecciona 'Continuar' para crear una nueva cuenta.",
  },
  fr: {
    welcomeTo: "Bienvenue sur HOT's",
    didYouHaveAccount: "Avez-vous déjà un compte ?",
    ifPreviouslyUsed: "Si vous vous êtes déjà connecté",
    recoverData: "avant, vous pouvez récupérer vos données.",
    yesRecoverAccount: "Récupérer mon compte existant",
    continue: "Continuer",
    connectOsmAccount: "Connectez votre compte OpenStreetMap",
    connectSameOsm:
      "Connectez-vous avec le même compte OSM que vous avez utilisé auparavant pour récupérer votre",
    goBack: "← Retour",
    cancelOnboarding: "Annuler",
    settingUpAccount: "Configuration de votre compte...",
    accessAllTools: "Accédez à tous les outils et services HOT",
    myProfile: "Mon Profil",
    back: "Retour",
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
    logOut: "Se déconnecter",
    security: "Sécurité",
    managePasswordPasskeys:
      "Gérez votre mot de passe, passkeys et sessions actives.",
    dangerZone: "Zone Dangereuse",
    deleteAccountWarning:
      "Supprimer définitivement votre compte et toutes les données associées.",
    deleteAccount: "Supprimer le Compte",
    deleteConfirm:
      "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action ne peut pas être annulée.",
    deleteComingSoon: "La suppression de compte sera bientôt disponible.",
    accountCreated: "Compte créé",
    accountDeleted: "Votre compte a été supprimé avec succès.",
    profileUpdated: "Profil mis à jour avec succès",
    developerSettings: "Paramètres Développeur",
    apiAccessTokens: "Tokens d'accès API",
    apiTokenWarning: "Gardez ces tokens en sécurité. Toute personne possédant un token peut accéder à votre compte dans l'application correspondante.",
    generateToken: "Générer un Token",
    regenerateToken: "Régénérer",
    revokeToken: "Révoquer",
    tokenCreatedOn: "Créé le",
    tokenLastUsed: "Dernière utilisation",
    tokenNeverUsed: "Jamais utilisé",
    tokenShownOnce: "Ce token ne sera plus affiché. Copiez-le maintenant.",
    tokenCopied: "Token copié !",
    copyToken: "Copier le Token",
    iSavedIt: "Je l'ai sauvegardé",
    regenerateConfirm: "Cela invalidera immédiatement le token précédent. Continuer ?",
    revokeConfirm: "Cela révoquera définitivement ce token. Continuer ?",
    noTokensYet: "Aucun token généré pour l'instant.",
    login: "Connexion",
    no_existing_osm_account: "Aucun compte existant trouvé pour votre utilisateur OSM. Veuillez sélectionner 'Continuer' pour créer un nouveau compte.",
  },
  pt: {
    welcomeTo: "Bem-vindo ao HOT's",
    didYouHaveAccount: "Você já tem uma conta?",
    ifPreviouslyUsed: "Se você já fez login",
    recoverData: "antes, você pode recuperar seus dados.",
    yesRecoverAccount: "Recuperar minha conta existente",
    continue: "Continuar",
    connectOsmAccount: "Conecte sua conta OpenStreetMap",
    connectSameOsm:
      "Conecte-se com a mesma conta OSM que você usou antes para recuperar seu",
    goBack: "← Voltar",
    cancelOnboarding: "Cancelar",
    settingUpAccount: "Configurando sua conta...",
    accessAllTools: "Acesse todas as ferramentas e serviços HOT",
    myProfile: "Meu Perfil",
    back: "Voltar",
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
    logOut: "Sair",
    security: "Segurança",
    managePasswordPasskeys: "Gerencie sua senha, passkeys e sessões ativas.",
    dangerZone: "Zona de Perigo",
    deleteAccountWarning:
      "Excluir permanentemente sua conta e todos os dados associados.",
    deleteAccount: "Excluir Conta",
    deleteConfirm:
      "Tem certeza de que deseja excluir sua conta? Esta ação não pode ser desfeita.",
    deleteComingSoon: "A exclusão de conta estará disponível em breve.",
    accountCreated: "Conta criada",
    accountDeleted: "Sua conta foi excluída com sucesso.",
    profileUpdated: "Perfil atualizado com sucesso",
    developerSettings: "Configurações de Desenvolvedor",
    apiAccessTokens: "Tokens de acesso API",
    apiTokenWarning: "Mantenha estes tokens seguros. Qualquer pessoa com um token pode acessar sua conta no aplicativo correspondente.",
    generateToken: "Gerar Token",
    regenerateToken: "Regenerar",
    revokeToken: "Revogar",
    tokenCreatedOn: "Criado em",
    tokenLastUsed: "Último uso",
    tokenNeverUsed: "Nunca usado",
    tokenShownOnce: "Este token não será mostrado novamente. Copie-o agora.",
    tokenCopied: "Token copiado!",
    copyToken: "Copiar Token",
    iSavedIt: "Já salvei",
    regenerateConfirm: "Isso invalidará o token anterior imediatamente. Continuar?",
    revokeConfirm: "Isso revogará permanentemente este token. Continuar?",
    noTokensYet: "Nenhum token gerado ainda.",
    login: "Login",
    no_existing_osm_account: "Nenhuma conta existente encontrada para o seu usuário OSM. Por favor selecione 'Continuar' para criar uma nova conta.",
  },
};

export const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "pt", name: "Português" },
];
