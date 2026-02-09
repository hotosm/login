/**
 * Translations for the hotosm-auth web component
 **/

export interface Translations {
  logIn: string;
  logOut: string;
  myHotAccount: string;
  connectToOsm: string;
  connectedToOsm: string;
  connectedToOpenStreetMap: string;
  connectingToOpenStreetMap: string;
  checkingOsmConnection: string;
  osmRequired: string;
  osmRequiredText: string;
  connectOsmAccount: string;
  openAccountMenu: string;
  connectedToOsmAs: string;
  osmConnectionRequired: string;
}

export const translations: Record<string, Translations> = {
  en: {
    logIn: "Log in",
    logOut: "Log Out",
    myHotAccount: "My HOT Account",
    connectToOsm: "Connect to OSM",
    connectedToOsm: "Connected to OSM",
    connectedToOpenStreetMap: "Connected to OpenStreetMap",
    connectingToOpenStreetMap: "Connecting to OpenStreetMap...",
    checkingOsmConnection: "Checking OSM connection...",
    osmRequired: "OSM Required",
    osmRequiredText: "This endpoint requires OSM connection.",
    connectOsmAccount: "Connect OSM Account",
    openAccountMenu: "Open account menu",
    connectedToOsmAs: "Connected to OSM as",
    osmConnectionRequired: "OSM connection required",
  },
  es: {
    logIn: "Iniciar sesión",
    logOut: "Cerrar sesión",
    myHotAccount: "Mi cuenta HOT",
    connectToOsm: "Conectar a OSM",
    connectedToOsm: "Conectado a OSM",
    connectedToOpenStreetMap: "Conectado a OpenStreetMap",
    connectingToOpenStreetMap: "Conectando a OpenStreetMap...",
    checkingOsmConnection: "Verificando conexión OSM...",
    osmRequired: "OSM Requerido",
    osmRequiredText: "Este endpoint requiere conexión OSM.",
    connectOsmAccount: "Conectar cuenta OSM",
    openAccountMenu: "Abrir menú de cuenta",
    connectedToOsmAs: "Conectado a OSM como",
    osmConnectionRequired: "Se requiere conexión OSM",
  },
  fr: {
    logIn: "Se connecter",
    logOut: "Se déconnecter",
    myHotAccount: "Mon compte HOT",
    connectToOsm: "Connecter à OSM",
    connectedToOsm: "Connecté à OSM",
    connectedToOpenStreetMap: "Connecté à OpenStreetMap",
    connectingToOpenStreetMap: "Connexion à OpenStreetMap...",
    checkingOsmConnection: "Vérification de la connexion OSM...",
    osmRequired: "OSM requis",
    osmRequiredText: "Ce point de terminaison nécessite une connexion OSM.",
    connectOsmAccount: "Connecter le compte OSM",
    openAccountMenu: "Ouvrir le menu du compte",
    connectedToOsmAs: "Connecté à OSM en tant que",
    osmConnectionRequired: "Connexion OSM requise",
  },
  pt: {
    logIn: "Entrar",
    logOut: "Sair",
    myHotAccount: "Minha conta HOT",
    connectToOsm: "Conectar ao OSM",
    connectedToOsm: "Conectado ao OSM",
    connectedToOpenStreetMap: "Conectado ao OpenStreetMap",
    connectingToOpenStreetMap: "Conectando ao OpenStreetMap...",
    checkingOsmConnection: "Verificando conexão OSM...",
    osmRequired: "OSM Necessário",
    osmRequiredText: "Este endpoint requer conexão OSM.",
    connectOsmAccount: "Conectar conta OSM",
    openAccountMenu: "Abrir menu da conta",
    connectedToOsmAs: "Conectado ao OSM como",
    osmConnectionRequired: "Conexão OSM necessária",
  },
};
