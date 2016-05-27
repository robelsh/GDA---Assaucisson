/*
** Fonction comprenant les différents thèmes de l'application
** On peut avoir plus d'informations sur cette technologie sur http://www.material-ui.com/#/customization/themes
*/

//Importation des couleurs de Material-UI
import {
cyan500, cyan700,
grey100, grey300, grey400, grey500,
pinkA200,
white, darkBlack, fullBlack, black, grey200
} from 'material-ui/styles/colors';
//On effectue une transition entre les changements de thèmes
import {fade} from 'material-ui/utils/colorManipulator';

export const lightBaseTheme = {
  spacing: {
    iconSize: 24,
    desktopGutter: 24,
    desktopGutterMore: 32,
    desktopGutterLess: 16,
    desktopGutterMini: 8,
    desktopKeylineIncrement: 64,
    desktopDropDownMenuItemHeight: 32,
    desktopDropDownMenuFontSize: 15,
    desktopDrawerMenuItemHeight: 48,
    desktopSubheaderHeight: 48,
    desktopToolbarHeight: 56,
  },
  fontFamily: 'Roboto, sans-serif',
  palette: {
    primary1Color: cyan500,
    primary2Color: cyan700,
    primary3Color: grey400,
    accent1Color: pinkA200,
    accent2Color: grey100,
    accent3Color: grey500,
    textColor: darkBlack,
    alternateTextColor: white,
    canvasColor: white,
    borderColor: grey300,
    disabledColor: fade(darkBlack, 0.3),
    pickerHeaderColor: cyan500,
    clockCircleColor: fade(darkBlack, 0.07),
    shadowColor: fullBlack,
  },
};

export let themeIsen =  {
  spacing: {
    iconSize: 24,
    desktopGutter: 24,
    desktopGutterMore: 32,
    desktopGutterLess: 16,
    desktopGutterMini: 8,
    desktopKeylineIncrement: 64,
    desktopDropDownMenuItemHeight: 32,
    desktopDropDownMenuFontSize: 15,
    desktopDrawerMenuItemHeight: 48,
    desktopSubheaderHeight: 48,
    desktopToolbarHeight: 56,
  },
  fontFamily: 'Roboto, sans-serif',
  palette: {
    primary1Color: "#E30613",
    primary2Color: "#fff",
    primary3Color:"#fff",
    accent1Color: "#E30613",//bouton secondaire
    accent2Color: "#fff", //Hover, boule des switchs
    accent3Color: "#E30613",
    textColor: black,
    alternateTextColor: grey300,
    canvasColor: grey200,
    borderColor: "#E30613",
    pickerHeaderColor: black,
    disabledColor: black,
    pickerHeaderColor: "#E30613",
  },
};
