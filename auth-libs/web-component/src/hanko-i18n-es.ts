/**
 * Spanish (es) translation for Hanko Elements
 * Based on the English translation structure
 */

export const es = {
  headlines: {
    error: "Ha ocurrido un error",
    loginEmail: "Iniciar sesión o crear cuenta",
    loginEmailNoSignup: "Iniciar sesión",
    loginFinished: "Inicio de sesión exitoso",
    loginPasscode: "Ingrese el código de acceso",
    loginPassword: "Ingrese la contraseña",
    registerAuthenticator: "Crear una llave de acceso",
    registerConfirm: "¿Crear cuenta?",
    registerPassword: "Establecer nueva contraseña",
    otpSetUp: "Configurar aplicación de autenticación",
    profileEmails: "Correos electrónicos",
    profilePassword: "Contraseña",
    profilePasskeys: "Llaves de acceso",
    isPrimaryEmail: "Dirección de correo principal",
    setPrimaryEmail: "Establecer correo principal",
    createEmail: "Ingrese un nuevo correo",
    createUsername: "Ingrese un nuevo nombre de usuario",
    emailVerified: "Verificado",
    emailUnverified: "No verificado",
    emailDelete: "Eliminar",
    renamePasskey: "Renombrar llave de acceso",
    deletePasskey: "Eliminar llave de acceso",
    lastUsedAt: "Último uso",
    createdAt: "Creado",
    connectedAccounts: "Cuentas conectadas",
    deleteAccount: "Eliminar cuenta",
    accountNotFound: "Cuenta no encontrada",
    signIn: "Iniciar sesión",
    signUp: "Crear cuenta",
    selectLoginMethod: "Seleccionar método de inicio de sesión",
    setupLoginMethod: "Configurar método de inicio de sesión",
    lastUsed: "Visto por última vez",
    ipAddress: "Dirección IP",
    revokeSession: "Revocar sesión",
    profileSessions: "Sesiones",
    mfaSetUp: "Configurar MFA",
    securityKeySetUp: "Agregar clave de seguridad",
    securityKeyLogin: "Clave de seguridad",
    otpLogin: "Código de autenticación",
    renameSecurityKey: "Renombrar clave de seguridad",
    deleteSecurityKey: "Eliminar clave de seguridad",
    securityKeys: "Claves de seguridad",
    authenticatorApp: "Aplicación de autenticación",
    authenticatorAppAlreadySetUp: "La aplicación de autenticación está configurada",
    authenticatorAppNotSetUp: "Configurar aplicación de autenticación",
    trustDevice: "¿Confiar en este navegador?",
  },
  texts: {
    enterPasscode: 'Ingrese el código que se envió a "{emailAddress}".',
    enterPasscodeNoEmail:
      "Ingrese el código que se envió a su dirección de correo principal.",
    setupPasskey:
      "Inicie sesión en su cuenta fácil y seguramente con una llave de acceso. Nota: Sus datos biométricos solo se almacenan en sus dispositivos y nunca se compartirán con nadie.",
    createAccount:
      'No existe una cuenta para "{emailAddress}". ¿Desea crear una nueva cuenta?',
    otpEnterVerificationCode:
      "Ingrese la contraseña de un solo uso (OTP) obtenida de su aplicación de autenticación a continuación:",
    otpScanQRCode:
      "Escanee el código QR usando su aplicación de autenticación (como Google Authenticator o cualquier otra aplicación TOTP). Alternativamente, puede ingresar manualmente la clave secreta OTP en la aplicación.",
    otpSecretKey: "Clave secreta OTP",
    passwordFormatHint:
      "Debe tener entre {minLength} y {maxLength} caracteres.",
    securityKeySetUp:
      "Use una clave de seguridad dedicada a través de USB, Bluetooth o NFC, o su teléfono móvil. Conecte o active su clave de seguridad, luego haga clic en el botón a continuación y siga las indicaciones para completar el registro.",
    setPrimaryEmail:
      "Establezca esta dirección de correo para ser usada para contactarlo.",
    isPrimaryEmail:
      "Esta dirección de correo se utilizará para contactarlo si es necesario.",
    emailVerified: "Esta dirección de correo ha sido verificada.",
    emailUnverified: "Esta dirección de correo no ha sido verificada.",
    emailDelete:
      "Si elimina esta dirección de correo, ya no podrá usarla para iniciar sesión.",
    renamePasskey: "Establecer un nombre para la llave de acceso.",
    deletePasskey: "Eliminar esta llave de acceso de su cuenta.",
    deleteAccount:
      "¿Está seguro de que desea eliminar esta cuenta? Todos los datos se eliminarán inmediatamente y no se podrán recuperar.",
    noAccountExists: 'No existe una cuenta para "{emailAddress}".',
    selectLoginMethodForFutureLogins:
      "Seleccione uno de los siguientes métodos de inicio de sesión para usar en futuros inicios de sesión.",
    howDoYouWantToLogin: "¿Cómo desea iniciar sesión?",
    mfaSetUp:
      "Proteja su cuenta con autenticación multifactor (MFA). MFA agrega un paso adicional a su proceso de inicio de sesión, asegurando que incluso si su contraseña o cuenta de correo está comprometida, su cuenta permanezca segura.",
    securityKeyLogin:
      "Conecte o active su clave de seguridad, luego haga clic en el botón a continuación. Una vez listo, úselo a través de USB, NFC o su teléfono móvil. Siga las indicaciones para completar el proceso de inicio de sesión.",
    otpLogin:
      "Abra su aplicación de autenticación para obtener la contraseña de un solo uso (OTP). Ingrese el código en el campo a continuación para completar su inicio de sesión.",
    renameSecurityKey: "Establecer un nombre para la clave de seguridad.",
    deleteSecurityKey: "Eliminar esta clave de seguridad de su cuenta.",
    authenticatorAppAlreadySetUp:
      "Su cuenta está protegida con una aplicación de autenticación que genera contraseñas de un solo uso basadas en tiempo (TOTP) para autenticación multifactor.",
    authenticatorAppNotSetUp:
      "Proteja su cuenta con una aplicación de autenticación que genera contraseñas de un solo uso basadas en tiempo (TOTP) para autenticación multifactor.",
    trustDevice:
      "Si confía en este navegador, no necesitará ingresar su OTP (contraseña de un solo uso) o usar su clave de seguridad para la autenticación multifactor (MFA) la próxima vez que inicie sesión.",
  },
  labels: {
    or: "o",
    no: "no",
    yes: "sí",
    email: "Correo electrónico",
    continue: "Continuar",
    copied: "copiado",
    skip: "Omitir",
    save: "Guardar",
    password: "Contraseña",
    passkey: "Llave de acceso",
    passcode: "Código de acceso",
    signInPassword: "Iniciar sesión con contraseña",
    signInPasscode: "Iniciar sesión con código",
    forgotYourPassword: "¿Olvidó su contraseña?",
    back: "Atrás",
    signInPasskey: "Iniciar sesión con llave de acceso",
    registerAuthenticator: "Crear una llave de acceso",
    signIn: "Iniciar sesión",
    signUp: "Crear cuenta",
    sendNewPasscode: "Enviar nuevo código",
    passwordRetryAfter: "Reintentar en {passwordRetryAfter}",
    passcodeResendAfter: "Solicitar nuevo código en {passcodeResendAfter}",
    unverifiedEmail: "no verificado",
    primaryEmail: "principal",
    setAsPrimaryEmail: "Establecer como principal",
    verify: "Verificar",
    delete: "Eliminar",
    newEmailAddress: "Nueva dirección de correo",
    newPassword: "Nueva contraseña",
    rename: "Renombrar",
    newPasskeyName: "Nuevo nombre de llave de acceso",
    addEmail: "Agregar correo",
    createPasskey: "Crear una llave de acceso",
    webauthnUnsupported:
      "Las llaves de acceso no son compatibles con su navegador",
    signInWith: "Iniciar sesión con {provider}",
    deleteAccount: "Sí, eliminar esta cuenta.",
    emailOrUsername: "Correo o nombre de usuario",
    username: "Nombre de usuario",
    optional: "opcional",
    dontHaveAnAccount: "¿No tiene una cuenta?",
    alreadyHaveAnAccount: "¿Ya tiene una cuenta?",
    changeUsername: "Cambiar nombre de usuario",
    setUsername: "Establecer nombre de usuario",
    changePassword: "Cambiar contraseña",
    setPassword: "Establecer contraseña",
    revoke: "Revocar",
    currentSession: "Sesión actual",
    authenticatorApp: "Aplicación de autenticación",
    securityKey: "Clave de seguridad",
    securityKeyUse: "Usar clave de seguridad",
    newSecurityKeyName: "Nuevo nombre de clave de seguridad",
    createSecurityKey: "Agregar una clave de seguridad",
    authenticatorAppManage: "Administrar aplicación de autenticación",
    authenticatorAppAdd: "Configurar",
    configured: "configurado",
    useAnotherMethod: "Usar otro método",
    lastUsed: "Último uso",
    trustDevice: "Confiar en este navegador",
    staySignedIn: "Mantener sesión iniciada",
  },
  errors: {
    somethingWentWrong:
      "Ha ocurrido un error técnico. Por favor, inténtelo de nuevo más tarde.",
    requestTimeout: "La solicitud ha expirado.",
    invalidPassword: "Correo o contraseña incorrectos.",
    invalidPasscode: "El código proporcionado no es correcto.",
    passcodeAttemptsReached:
      "El código se ha ingresado incorrectamente demasiadas veces. Por favor, solicite un nuevo código.",
    tooManyRequests:
      "Se han realizado demasiadas solicitudes. Por favor, espere para repetir la operación solicitada.",
    unauthorized:
      "Su sesión ha expirado. Por favor, inicie sesión nuevamente.",
    invalidWebauthnCredential: "Esta llave de acceso ya no se puede usar.",
    passcodeExpired: "El código ha expirado. Por favor, solicite uno nuevo.",
    userVerification:
      "Se requiere verificación de usuario. Asegúrese de que su dispositivo de autenticación esté protegido con un PIN o biometría.",
    emailAddressAlreadyExistsError: "La dirección de correo ya existe.",
    maxNumOfEmailAddressesReached:
      "No se pueden agregar más direcciones de correo.",
    thirdPartyAccessDenied:
      "Acceso denegado. La solicitud fue cancelada por el usuario o el proveedor ha denegado el acceso por otras razones.",
    thirdPartyMultipleAccounts:
      "No se puede identificar la cuenta. La dirección de correo es usada por múltiples cuentas.",
    thirdPartyUnverifiedEmail:
      "Se requiere verificación de correo. Por favor, verifique la dirección de correo usada con su proveedor.",
    signupDisabled: "El registro de cuentas está deshabilitado.",
    handlerNotFoundError:
      "El paso actual en su proceso no es compatible con esta versión de la aplicación. Inténtelo de nuevo más tarde o contacte al soporte si el problema persiste.",
  },
  flowErrors: {
    technical_error:
      "Ha ocurrido un error técnico. Por favor, inténtelo de nuevo más tarde.",
    flow_expired_error:
      "La sesión ha expirado, haga clic en el botón para reiniciar.",
    value_invalid_error: "El valor ingresado no es válido.",
    passcode_invalid: "El código proporcionado no es correcto.",
    passkey_invalid: "Esta llave de acceso ya no se puede usar.",
    passcode_max_attempts_reached:
      "El código se ha ingresado incorrectamente demasiadas veces. Por favor, solicite un nuevo código.",
    rate_limit_exceeded:
      "Se han realizado demasiadas solicitudes. Por favor, espere para repetir la operación solicitada.",
    unknown_username_error: "El nombre de usuario es desconocido.",
    unknown_email_error: "La dirección de correo es desconocida.",
    username_already_exists: "El nombre de usuario ya está en uso.",
    invalid_username_error:
      "El nombre de usuario solo debe contener letras, números y guiones bajos.",
    email_already_exists: "El correo ya está en uso.",
    not_found: "No se encontró el recurso solicitado.",
    operation_not_permitted_error: "La operación no está permitida.",
    flow_discontinuity_error:
      "El proceso no se puede continuar debido a la configuración del usuario o del proveedor.",
    form_data_invalid_error:
      "Los datos del formulario enviados contienen errores.",
    unauthorized: "Su sesión ha expirado. Por favor, inicie sesión nuevamente.",
    value_missing_error: "Falta el valor.",
    value_too_long_error: "El valor es demasiado largo.",
    value_too_short_error: "El valor es demasiado corto.",
    webauthn_credential_invalid_mfa_only:
      "Esta credencial solo se puede usar como clave de seguridad de segundo factor.",
    webauthn_credential_already_exists:
      "La solicitud expiró, se canceló o el dispositivo ya está registrado. Inténtelo de nuevo o intente usar otro dispositivo.",
    platform_authenticator_required:
      "Su cuenta está configurada para usar autenticadores de plataforma, pero su dispositivo o navegador actual no admite esta función. Inténtelo de nuevo con un dispositivo o navegador compatible.",
  },
};
