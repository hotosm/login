/**
 * Portuguese (pt) translation for Hanko Elements
 * Based on the English translation structure
 */

export const pt = {
  headlines: {
    error: "Ocorreu um erro",
    loginEmail: "Entrar ou criar conta",
    loginEmailNoSignup: "Entrar",
    loginFinished: "Login bem-sucedido",
    loginPasscode: "Digite o código de acesso",
    loginPassword: "Digite a senha",
    registerAuthenticator: "Criar uma chave de acesso",
    registerConfirm: "Criar conta?",
    registerPassword: "Definir nova senha",
    otpSetUp: "Configurar aplicativo de autenticação",
    profileEmails: "Endereços de e-mail",
    profilePassword: "Senha",
    profilePasskeys: "Chaves de acesso",
    isPrimaryEmail: "Endereço de e-mail principal",
    setPrimaryEmail: "Definir e-mail principal",
    createEmail: "Digite um novo e-mail",
    createUsername: "Digite um novo nome de usuário",
    emailVerified: "Verificado",
    emailUnverified: "Não verificado",
    emailDelete: "Excluir",
    renamePasskey: "Renomear chave de acesso",
    deletePasskey: "Excluir chave de acesso",
    lastUsedAt: "Último uso",
    createdAt: "Criado",
    connectedAccounts: "Contas conectadas",
    deleteAccount: "Excluir conta",
    accountNotFound: "Conta não encontrada",
    signIn: "Entrar",
    signUp: "Criar conta",
    selectLoginMethod: "Selecionar método de login",
    setupLoginMethod: "Configurar método de login",
    lastUsed: "Visto pela última vez",
    ipAddress: "Endereço IP",
    revokeSession: "Revogar sessão",
    profileSessions: "Sessões",
    mfaSetUp: "Configurar MFA",
    securityKeySetUp: "Adicionar chave de segurança",
    securityKeyLogin: "Chave de segurança",
    otpLogin: "Código de autenticação",
    renameSecurityKey: "Renomear chave de segurança",
    deleteSecurityKey: "Excluir chave de segurança",
    securityKeys: "Chaves de segurança",
    authenticatorApp: "Aplicativo de autenticação",
    authenticatorAppAlreadySetUp: "O aplicativo de autenticação está configurado",
    authenticatorAppNotSetUp: "Configurar aplicativo de autenticação",
    trustDevice: "Confiar neste navegador?",
  },
  texts: {
    enterPasscode: 'Digite o código enviado para "{emailAddress}".',
    enterPasscodeNoEmail:
      "Digite o código enviado para seu endereço de e-mail principal.",
    setupPasskey:
      "Faça login na sua conta de forma fácil e segura com uma chave de acesso. Nota: Seus dados biométricos são armazenados apenas em seus dispositivos e nunca serão compartilhados com ninguém.",
    createAccount:
      'Não existe uma conta para "{emailAddress}". Deseja criar uma nova conta?',
    otpEnterVerificationCode:
      "Digite a senha de uso único (OTP) obtida do seu aplicativo de autenticação abaixo:",
    otpScanQRCode:
      "Digitalize o código QR usando seu aplicativo de autenticação (como Google Authenticator ou qualquer outro aplicativo TOTP). Alternativamente, você pode inserir manualmente a chave secreta OTP no aplicativo.",
    otpSecretKey: "Chave secreta OTP",
    passwordFormatHint:
      "Deve ter entre {minLength} e {maxLength} caracteres.",
    securityKeySetUp:
      "Use uma chave de segurança dedicada via USB, Bluetooth ou NFC, ou seu telefone celular. Conecte ou ative sua chave de segurança, depois clique no botão abaixo e siga as instruções para concluir o registro.",
    setPrimaryEmail:
      "Defina este endereço de e-mail para ser usado para entrar em contato com você.",
    isPrimaryEmail:
      "Este endereço de e-mail será usado para entrar em contato com você, se necessário.",
    emailVerified: "Este endereço de e-mail foi verificado.",
    emailUnverified: "Este endereço de e-mail não foi verificado.",
    emailDelete:
      "Se você excluir este endereço de e-mail, não poderá mais usá-lo para fazer login.",
    renamePasskey: "Definir um nome para a chave de acesso.",
    deletePasskey: "Excluir esta chave de acesso da sua conta.",
    deleteAccount:
      "Tem certeza de que deseja excluir esta conta? Todos os dados serão excluídos imediatamente e não poderão ser recuperados.",
    noAccountExists: 'Não existe uma conta para "{emailAddress}".',
    selectLoginMethodForFutureLogins:
      "Selecione um dos seguintes métodos de login para usar em futuros logins.",
    howDoYouWantToLogin: "Como você deseja fazer login?",
    mfaSetUp:
      "Proteja sua conta com autenticação multifator (MFA). MFA adiciona uma etapa extra ao seu processo de login, garantindo que, mesmo se sua senha ou conta de e-mail for comprometida, sua conta permaneça segura.",
    securityKeyLogin:
      "Conecte ou ative sua chave de segurança, depois clique no botão abaixo. Uma vez pronto, use-a via USB, NFC ou seu telefone celular. Siga as instruções para concluir o processo de login.",
    otpLogin:
      "Abra seu aplicativo de autenticação para obter a senha de uso único (OTP). Digite o código no campo abaixo para concluir seu login.",
    renameSecurityKey: "Definir um nome para a chave de segurança.",
    deleteSecurityKey: "Excluir esta chave de segurança da sua conta.",
    authenticatorAppAlreadySetUp:
      "Sua conta está protegida com um aplicativo de autenticação que gera senhas de uso único baseadas em tempo (TOTP) para autenticação multifator.",
    authenticatorAppNotSetUp:
      "Proteja sua conta com um aplicativo de autenticação que gera senhas de uso único baseadas em tempo (TOTP) para autenticação multifator.",
    trustDevice:
      "Se você confiar neste navegador, não precisará inserir seu OTP (senha de uso único) ou usar sua chave de segurança para autenticação multifator (MFA) na próxima vez que fizer login.",
  },
  labels: {
    or: "ou",
    no: "não",
    yes: "sim",
    email: "E-mail",
    continue: "Continuar",
    copied: "copiado",
    skip: "Pular",
    save: "Salvar",
    password: "Senha",
    passkey: "Chave de acesso",
    passcode: "Código de acesso",
    signInPassword: "Entrar com senha",
    signInPasscode: "Entrar com código",
    forgotYourPassword: "Esqueceu sua senha?",
    back: "Voltar",
    signInPasskey: "Entrar com chave de acesso",
    registerAuthenticator: "Criar uma chave de acesso",
    signIn: "Entrar",
    signUp: "Criar conta",
    sendNewPasscode: "Enviar novo código",
    passwordRetryAfter: "Tentar novamente em {passwordRetryAfter}",
    passcodeResendAfter: "Solicitar novo código em {passcodeResendAfter}",
    unverifiedEmail: "não verificado",
    primaryEmail: "principal",
    setAsPrimaryEmail: "Definir como principal",
    verify: "Verificar",
    delete: "Excluir",
    newEmailAddress: "Novo endereço de e-mail",
    newPassword: "Nova senha",
    rename: "Renomear",
    newPasskeyName: "Novo nome de chave de acesso",
    addEmail: "Adicionar e-mail",
    createPasskey: "Criar uma chave de acesso",
    webauthnUnsupported:
      "As chaves de acesso não são compatíveis com seu navegador",
    signInWith: "Entrar com {provider}",
    deleteAccount: "Sim, excluir esta conta.",
    emailOrUsername: "E-mail ou nome de usuário",
    username: "Nome de usuário",
    optional: "opcional",
    dontHaveAnAccount: "Não tem uma conta?",
    alreadyHaveAnAccount: "Já tem uma conta?",
    changeUsername: "Alterar nome de usuário",
    setUsername: "Definir nome de usuário",
    changePassword: "Alterar senha",
    setPassword: "Definir senha",
    revoke: "Revogar",
    currentSession: "Sessão atual",
    authenticatorApp: "Aplicativo de autenticação",
    securityKey: "Chave de segurança",
    securityKeyUse: "Usar chave de segurança",
    newSecurityKeyName: "Novo nome de chave de segurança",
    createSecurityKey: "Adicionar uma chave de segurança",
    authenticatorAppManage: "Gerenciar aplicativo de autenticação",
    authenticatorAppAdd: "Configurar",
    configured: "configurado",
    useAnotherMethod: "Usar outro método",
    lastUsed: "Último uso",
    trustDevice: "Confiar neste navegador",
    staySignedIn: "Permanecer conectado",
  },
  errors: {
    somethingWentWrong:
      "Ocorreu um erro técnico. Por favor, tente novamente mais tarde.",
    requestTimeout: "A solicitação expirou.",
    invalidPassword: "E-mail ou senha incorretos.",
    invalidPasscode: "O código fornecido não está correto.",
    passcodeAttemptsReached:
      "O código foi inserido incorretamente muitas vezes. Por favor, solicite um novo código.",
    tooManyRequests:
      "Muitas solicitações foram feitas. Por favor, aguarde antes de repetir a operação solicitada.",
    unauthorized:
      "Sua sessão expirou. Por favor, faça login novamente.",
    invalidWebauthnCredential: "Esta chave de acesso não pode mais ser usada.",
    passcodeExpired: "O código expirou. Por favor, solicite um novo.",
    userVerification:
      "É necessária verificação do usuário. Certifique-se de que seu dispositivo de autenticação esteja protegido com um PIN ou biometria.",
    emailAddressAlreadyExistsError: "O endereço de e-mail já existe.",
    maxNumOfEmailAddressesReached:
      "Não é possível adicionar mais endereços de e-mail.",
    thirdPartyAccessDenied:
      "Acesso negado. A solicitação foi cancelada pelo usuário ou o provedor negou o acesso por outros motivos.",
    thirdPartyMultipleAccounts:
      "Não é possível identificar a conta. O endereço de e-mail é usado por várias contas.",
    thirdPartyUnverifiedEmail:
      "É necessária verificação de e-mail. Por favor, verifique o endereço de e-mail usado com seu provedor.",
    signupDisabled: "O registro de contas está desativado.",
    handlerNotFoundError:
      "A etapa atual em seu processo não é compatível com esta versão do aplicativo. Tente novamente mais tarde ou entre em contato com o suporte se o problema persistir.",
  },
  flowErrors: {
    technical_error:
      "Ocorreu um erro técnico. Por favor, tente novamente mais tarde.",
    flow_expired_error:
      "A sessão expirou, clique no botão para reiniciar.",
    value_invalid_error: "O valor inserido não é válido.",
    passcode_invalid: "O código fornecido não está correto.",
    passkey_invalid: "Esta chave de acesso não pode mais ser usada.",
    passcode_max_attempts_reached:
      "O código foi inserido incorretamente muitas vezes. Por favor, solicite um novo código.",
    rate_limit_exceeded:
      "Muitas solicitações foram feitas. Por favor, aguarde antes de repetir a operação solicitada.",
    unknown_username_error: "O nome de usuário é desconhecido.",
    unknown_email_error: "O endereço de e-mail é desconhecido.",
    username_already_exists: "O nome de usuário já está em uso.",
    invalid_username_error:
      "O nome de usuário deve conter apenas letras, números e sublinhados.",
    email_already_exists: "O e-mail já está em uso.",
    not_found: "O recurso solicitado não foi encontrado.",
    operation_not_permitted_error: "A operação não é permitida.",
    flow_discontinuity_error:
      "O processo não pode continuar devido à configuração do usuário ou do provedor.",
    form_data_invalid_error:
      "Os dados do formulário enviados contêm erros.",
    unauthorized: "Sua sessão expirou. Por favor, faça login novamente.",
    value_missing_error: "O valor está faltando.",
    value_too_long_error: "O valor é muito longo.",
    value_too_short_error: "O valor é muito curto.",
    webauthn_credential_invalid_mfa_only:
      "Esta credencial só pode ser usada como chave de segurança de segundo fator.",
    webauthn_credential_already_exists:
      "A solicitação expirou, foi cancelada ou o dispositivo já está registrado. Tente novamente ou tente usar outro dispositivo.",
    platform_authenticator_required:
      "Sua conta está configurada para usar autenticadores de plataforma, mas seu dispositivo ou navegador atual não suporta esse recurso. Tente novamente com um dispositivo ou navegador compatível.",
    third_party_access_denied:
      "Acesso negado pelo provedor de terceiros. Por favor, tente novamente.",
  },
};
