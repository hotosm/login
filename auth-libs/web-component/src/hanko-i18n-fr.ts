/**
 * French (fr) translation for Hanko Elements
 * Based on the English translation structure
 */

export const fr = {
  headlines: {
    error: "Une erreur s'est produite",
    loginEmail: "Se connecter ou créer un compte",
    loginEmailNoSignup: "Se connecter",
    loginFinished: "Connexion réussie",
    loginPasscode: "Entrez le code d'accès",
    loginPassword: "Entrez le mot de passe",
    registerAuthenticator: "Créer une clé d'accès",
    registerConfirm: "Créer un compte ?",
    registerPassword: "Définir un nouveau mot de passe",
    otpSetUp: "Configurer l'application d'authentification",
    profileEmails: "Adresses e-mail",
    profilePassword: "Mot de passe",
    profilePasskeys: "Clés d'accès",
    isPrimaryEmail: "Adresse e-mail principale",
    setPrimaryEmail: "Définir comme e-mail principal",
    createEmail: "Entrez un nouvel e-mail",
    createUsername: "Entrez un nouveau nom d'utilisateur",
    emailVerified: "Vérifié",
    emailUnverified: "Non vérifié",
    emailDelete: "Supprimer",
    renamePasskey: "Renommer la clé d'accès",
    deletePasskey: "Supprimer la clé d'accès",
    lastUsedAt: "Dernière utilisation",
    createdAt: "Créé",
    connectedAccounts: "Comptes connectés",
    deleteAccount: "Supprimer le compte",
    accountNotFound: "Compte introuvable",
    signIn: "Se connecter",
    signUp: "Créer un compte",
    selectLoginMethod: "Sélectionner la méthode de connexion",
    setupLoginMethod: "Configurer la méthode de connexion",
    lastUsed: "Vu pour la dernière fois",
    ipAddress: "Adresse IP",
    revokeSession: "Révoquer la session",
    profileSessions: "Sessions",
    mfaSetUp: "Configurer MFA",
    securityKeySetUp: "Ajouter une clé de sécurité",
    securityKeyLogin: "Clé de sécurité",
    otpLogin: "Code d'authentification",
    renameSecurityKey: "Renommer la clé de sécurité",
    deleteSecurityKey: "Supprimer la clé de sécurité",
    securityKeys: "Clés de sécurité",
    authenticatorApp: "Application d'authentification",
    authenticatorAppAlreadySetUp: "L'application d'authentification est configurée",
    authenticatorAppNotSetUp: "Configurer l'application d'authentification",
    trustDevice: "Faire confiance à ce navigateur ?",
  },
  texts: {
    enterPasscode: 'Entrez le code envoyé à "{emailAddress}".',
    enterPasscodeNoEmail:
      "Entrez le code envoyé à votre adresse e-mail principale.",
    setupPasskey:
      "Connectez-vous à votre compte facilement et en toute sécurité avec une clé d'accès. Remarque : Vos données biométriques ne sont stockées que sur vos appareils et ne seront jamais partagées avec personne.",
    createAccount:
      'Aucun compte n\'existe pour "{emailAddress}". Souhaitez-vous créer un nouveau compte ?',
    otpEnterVerificationCode:
      "Entrez le mot de passe à usage unique (OTP) obtenu depuis votre application d'authentification ci-dessous :",
    otpScanQRCode:
      "Scannez le code QR avec votre application d'authentification (comme Google Authenticator ou toute autre application TOTP). Vous pouvez également saisir manuellement la clé secrète OTP dans l'application.",
    otpSecretKey: "Clé secrète OTP",
    passwordFormatHint:
      "Doit contenir entre {minLength} et {maxLength} caractères.",
    securityKeySetUp:
      "Utilisez une clé de sécurité dédiée via USB, Bluetooth ou NFC, ou votre téléphone mobile. Connectez ou activez votre clé de sécurité, puis cliquez sur le bouton ci-dessous et suivez les instructions pour terminer l'inscription.",
    setPrimaryEmail:
      "Définir cette adresse e-mail pour être utilisée pour vous contacter.",
    isPrimaryEmail:
      "Cette adresse e-mail sera utilisée pour vous contacter si nécessaire.",
    emailVerified: "Cette adresse e-mail a été vérifiée.",
    emailUnverified: "Cette adresse e-mail n'a pas été vérifiée.",
    emailDelete:
      "Si vous supprimez cette adresse e-mail, vous ne pourrez plus l'utiliser pour vous connecter.",
    renamePasskey: "Définir un nom pour la clé d'accès.",
    deletePasskey: "Supprimer cette clé d'accès de votre compte.",
    deleteAccount:
      "Êtes-vous sûr de vouloir supprimer ce compte ? Toutes les données seront supprimées immédiatement et ne pourront pas être récupérées.",
    noAccountExists: 'Aucun compte n\'existe pour "{emailAddress}".',
    selectLoginMethodForFutureLogins:
      "Sélectionnez l'une des méthodes de connexion suivantes à utiliser pour les futures connexions.",
    howDoYouWantToLogin: "Comment souhaitez-vous vous connecter ?",
    mfaSetUp:
      "Protégez votre compte avec l'authentification multifacteur (MFA). MFA ajoute une étape supplémentaire à votre processus de connexion, garantissant que même si votre mot de passe ou compte e-mail est compromis, votre compte reste sécurisé.",
    securityKeyLogin:
      "Connectez ou activez votre clé de sécurité, puis cliquez sur le bouton ci-dessous. Une fois prêt, utilisez-la via USB, NFC ou votre téléphone mobile. Suivez les instructions pour terminer le processus de connexion.",
    otpLogin:
      "Ouvrez votre application d'authentification pour obtenir le mot de passe à usage unique (OTP). Entrez le code dans le champ ci-dessous pour terminer votre connexion.",
    renameSecurityKey: "Définir un nom pour la clé de sécurité.",
    deleteSecurityKey: "Supprimer cette clé de sécurité de votre compte.",
    authenticatorAppAlreadySetUp:
      "Votre compte est protégé par une application d'authentification qui génère des mots de passe à usage unique basés sur le temps (TOTP) pour l'authentification multifacteur.",
    authenticatorAppNotSetUp:
      "Protégez votre compte avec une application d'authentification qui génère des mots de passe à usage unique basés sur le temps (TOTP) pour l'authentification multifacteur.",
    trustDevice:
      "Si vous faites confiance à ce navigateur, vous n'aurez pas besoin de saisir votre OTP (mot de passe à usage unique) ou d'utiliser votre clé de sécurité pour l'authentification multifacteur (MFA) la prochaine fois que vous vous connecterez.",
  },
  labels: {
    or: "ou",
    no: "non",
    yes: "oui",
    email: "E-mail",
    continue: "Continuer",
    copied: "copié",
    skip: "Ignorer",
    save: "Enregistrer",
    password: "Mot de passe",
    passkey: "Clé d'accès",
    passcode: "Code d'accès",
    signInPassword: "Se connecter avec mot de passe",
    signInPasscode: "Se connecter avec code",
    forgotYourPassword: "Mot de passe oublié ?",
    back: "Retour",
    signInPasskey: "Se connecter avec clé d'accès",
    registerAuthenticator: "Créer une clé d'accès",
    signIn: "Se connecter",
    signUp: "Créer un compte",
    sendNewPasscode: "Envoyer un nouveau code",
    passwordRetryAfter: "Réessayer dans {passwordRetryAfter}",
    passcodeResendAfter: "Demander un nouveau code dans {passcodeResendAfter}",
    unverifiedEmail: "non vérifié",
    primaryEmail: "principal",
    setAsPrimaryEmail: "Définir comme principal",
    verify: "Vérifier",
    delete: "Supprimer",
    newEmailAddress: "Nouvelle adresse e-mail",
    newPassword: "Nouveau mot de passe",
    rename: "Renommer",
    newPasskeyName: "Nouveau nom de clé d'accès",
    addEmail: "Ajouter un e-mail",
    createPasskey: "Créer une clé d'accès",
    webauthnUnsupported:
      "Les clés d'accès ne sont pas compatibles avec votre navigateur",
    signInWith: "Se connecter avec {provider}",
    deleteAccount: "Oui, supprimer ce compte.",
    emailOrUsername: "E-mail ou nom d'utilisateur",
    username: "Nom d'utilisateur",
    optional: "optionnel",
    dontHaveAnAccount: "Vous n'avez pas de compte ?",
    alreadyHaveAnAccount: "Vous avez déjà un compte ?",
    changeUsername: "Changer le nom d'utilisateur",
    setUsername: "Définir le nom d'utilisateur",
    changePassword: "Changer le mot de passe",
    setPassword: "Définir le mot de passe",
    revoke: "Révoquer",
    currentSession: "Session actuelle",
    authenticatorApp: "Application d'authentification",
    securityKey: "Clé de sécurité",
    securityKeyUse: "Utiliser la clé de sécurité",
    newSecurityKeyName: "Nouveau nom de clé de sécurité",
    createSecurityKey: "Ajouter une clé de sécurité",
    authenticatorAppManage: "Gérer l'application d'authentification",
    authenticatorAppAdd: "Configurer",
    configured: "configuré",
    useAnotherMethod: "Utiliser une autre méthode",
    lastUsed: "Dernière utilisation",
    trustDevice: "Faire confiance à ce navigateur",
    staySignedIn: "Rester connecté",
  },
  errors: {
    somethingWentWrong:
      "Une erreur technique s'est produite. Veuillez réessayer plus tard.",
    requestTimeout: "La demande a expiré.",
    invalidPassword: "E-mail ou mot de passe incorrect.",
    invalidPasscode: "Le code fourni n'est pas correct.",
    passcodeAttemptsReached:
      "Le code a été saisi incorrectement trop de fois. Veuillez demander un nouveau code.",
    tooManyRequests:
      "Trop de demandes ont été effectuées. Veuillez attendre avant de répéter l'opération demandée.",
    unauthorized:
      "Votre session a expiré. Veuillez vous reconnecter.",
    invalidWebauthnCredential: "Cette clé d'accès ne peut plus être utilisée.",
    passcodeExpired: "Le code a expiré. Veuillez en demander un nouveau.",
    userVerification:
      "Une vérification de l'utilisateur est requise. Assurez-vous que votre dispositif d'authentification est protégé par un code PIN ou une biométrie.",
    emailAddressAlreadyExistsError: "L'adresse e-mail existe déjà.",
    maxNumOfEmailAddressesReached:
      "Impossible d'ajouter plus d'adresses e-mail.",
    thirdPartyAccessDenied:
      "Accès refusé. La demande a été annulée par l'utilisateur ou le fournisseur a refusé l'accès pour d'autres raisons.",
    thirdPartyMultipleAccounts:
      "Impossible d'identifier le compte. L'adresse e-mail est utilisée par plusieurs comptes.",
    thirdPartyUnverifiedEmail:
      "Une vérification de l'e-mail est requise. Veuillez vérifier l'adresse e-mail utilisée avec votre fournisseur.",
    signupDisabled: "L'inscription de comptes est désactivée.",
    handlerNotFoundError:
      "L'étape actuelle de votre processus n'est pas compatible avec cette version de l'application. Réessayez plus tard ou contactez le support si le problème persiste.",
  },
  flowErrors: {
    technical_error:
      "Une erreur technique s'est produite. Veuillez réessayer plus tard.",
    flow_expired_error:
      "La session a expiré, cliquez sur le bouton pour redémarrer.",
    value_invalid_error: "La valeur saisie n'est pas valide.",
    passcode_invalid: "Le code fourni n'est pas correct.",
    passkey_invalid: "Cette clé d'accès ne peut plus être utilisée.",
    passcode_max_attempts_reached:
      "Le code a été saisi incorrectement trop de fois. Veuillez demander un nouveau code.",
    rate_limit_exceeded:
      "Trop de demandes ont été effectuées. Veuillez attendre avant de répéter l'opération demandée.",
    unknown_username_error: "Le nom d'utilisateur est inconnu.",
    unknown_email_error: "L'adresse e-mail est inconnue.",
    username_already_exists: "Le nom d'utilisateur est déjà utilisé.",
    invalid_username_error:
      "Le nom d'utilisateur ne doit contenir que des lettres, des chiffres et des traits de soulignement.",
    email_already_exists: "L'e-mail est déjà utilisé.",
    not_found: "La ressource demandée n'a pas été trouvée.",
    operation_not_permitted_error: "L'opération n'est pas autorisée.",
    flow_discontinuity_error:
      "Le processus ne peut pas continuer en raison de la configuration de l'utilisateur ou du fournisseur.",
    form_data_invalid_error:
      "Les données du formulaire soumises contiennent des erreurs.",
    unauthorized: "Votre session a expiré. Veuillez vous reconnecter.",
    value_missing_error: "La valeur est manquante.",
    value_too_long_error: "La valeur est trop longue.",
    value_too_short_error: "La valeur est trop courte.",
    webauthn_credential_invalid_mfa_only:
      "Cette credential ne peut être utilisée que comme clé de sécurité de second facteur.",
    webauthn_credential_already_exists:
      "La demande a expiré, a été annulée ou l'appareil est déjà enregistré. Réessayez ou essayez d'utiliser un autre appareil.",
    platform_authenticator_required:
      "Votre compte est configuré pour utiliser des authentificateurs de plateforme, mais votre appareil ou navigateur actuel ne prend pas en charge cette fonctionnalité. Réessayez avec un appareil ou navigateur compatible.",
    third_party_access_denied:
      "Accès refusé par le fournisseur tiers. Veuillez réessayer.",
  },
};
