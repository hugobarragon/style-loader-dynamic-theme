declare global {
  interface Window {
    exports: any;
  }
}

if (typeof window.exports != "object") {
  //cdn usage on browsers without "exports" variable
  window.exports = {};
}

export interface LazyStyle {
  default: { use: () => void; unuse: () => void };
}

export type ThemeName = undefined | string;

export type ThemeData = undefined | Record<string, Promise<LazyStyle>>;

export type ConstructorData = {
  currentTheme: ThemeName;
  themeData: ThemeData;
  storageKey?: string;
  dataAttrKey?: string;
  debug?: boolean;
};

export class ThemeManager {
  // theme in use
  currentTheme: ConstructorData["currentTheme"] = undefined;
  // list of theme files
  themeData: ConstructorData["themeData"] = undefined;
  // storage key that will show current theme on storage
  storageKey: ConstructorData["storageKey"] = "style-theme-switcher";
  // attr to show current theme
  dataAttrKey: ConstructorData["dataAttrKey"] = "data-theme";
  // to show errors
  debug = false;

  constructor(data?: ConstructorData) {
    // method bind
    this.setInitialData = this.setInitialData.bind(this);
    this.setCurrentTheme = this.setCurrentTheme.bind(this);
    this.checkThemeExists = this.checkThemeExists.bind(this);
    this.removeTheme = this.removeTheme.bind(this);

    // set initial data
    this.setInitialData(data);
  }

  /**
   * Calls style-loader .use method to load theme from dom
   * @param themeInstance Promise<LazyStyle>
   */
  private loadTheme(themeInstance: Promise<LazyStyle>): void {
    themeInstance.then((file) => {
      file.default.use();
    });
  }

  /**
   * Calls style-loader .unuse method to remove theme from dom
   * @param themeInstance Promise<LazyStyle>
   */
  private unloadTheme(themeInstance: Promise<LazyStyle>) {
    themeInstance.then((file) => {
      file.default.unuse();
    });
  }

  /**
   * Saves passed data instances
   * @param data ConstructorData
   */
  setInitialData(data?: ConstructorData): void {
    if (typeof data === "object" && !Array.isArray(data) && data !== null) {
      // save list of themes
      this.themeData = data.themeData;
      this.debug = data.debug || false;
      this.storageKey = data.storageKey || this.storageKey;
      this.dataAttrKey = data.dataAttrKey || this.dataAttrKey;
      // swith saves theme
      this.switchTheme(data.currentTheme);
    }
  }

  /**
   * Saves current theme on calss storage and dom for feedback
   * @param themeName ConstructorData["currentTheme"]
   */
  setCurrentTheme(themeName: ConstructorData["currentTheme"]): void {
    if (themeName) {
      this.currentTheme = themeName;
      // save local storage
      localStorage.setItem(this.storageKey as string, themeName);
      // update data attribute
      document.body.setAttribute(this.dataAttrKey as string, themeName);
    }
  }

  /**
   * Checks if theme exists on saved list
   * @param themeName ThemeName
   * @returns  Promise<LazyStyle> | false
   */
  checkThemeExists(themeName: ThemeName): Promise<LazyStyle> | false {
    if (
      themeName &&
      this.themeData &&
      Object.prototype.hasOwnProperty.call(this.themeData, themeName)
    ) {
      return this.themeData[themeName];
    }

    if (this.debug) {
      console.error("theme not found on list");
    }

    return false;
  }

  /**
   * Changes theme, removes old and load new one
   * @param newThemeName ThemeName
   */
  switchTheme(newThemeName: ThemeName): void {
    const themeInstance = this.checkThemeExists(newThemeName);

    if (themeInstance && newThemeName) {
      // remove old (FIRST)
      this.removeTheme();

      // load new (load new to dom)
      this.loadTheme(themeInstance);

      // set new (SAVE NEW THEME)
      this.setCurrentTheme(newThemeName);
    }
  }

  /**
   * Removes current theme from dom
   */
  removeTheme(): void {
    const themeInstance = this.checkThemeExists(this.currentTheme);

    if (themeInstance) {
      // remove from dom
      this.unloadTheme(themeInstance);
    } else if (this.debug) {
      console.error(new Error("removing theme error does not exist"));
    }
  }
}

export default ThemeManager;
