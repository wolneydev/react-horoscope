/**
 * Tema global do aplicativo
 * Contém variáveis de cores, espaçamentos e outros estilos reutilizáveis
 */

export const COLORS = {
  // Cores primárias
  PRIMARY: '#6D44FF',
  PRIMARY_LIGHT: 'rgba(109, 68, 255, 0.3)',
  PRIMARY_DARK: '#5835CC',
  
  // Cores secundárias
  SECONDARY: '#20B2AA', // Turquesa
  SECONDARY_LIGHT: 'rgba(32, 178, 170, 0.15)',
  
  // Cores de fundo
  BACKGROUND: '#141527',
  BACKGROUND_DARK: '#121629',
  CARD_BACKGROUND: 'rgba(109, 68, 255, 0.2)',
  
  // Cores de texto
  TEXT_PRIMARY: '#FFFFFF',
  TEXT_SECONDARY: '#bbb',
  TEXT_TERTIARY: '#7A708E',
  
  // Cores de status
  SUCCESS: '#4CAF50',
  SUCCESS_LIGHT: 'rgba(76, 175, 80, 0.1)',
  SUCCESS_BORDER: 'rgba(76, 175, 80, 0.3)',
  
  WARNING: '#FFD700',
  WARNING_LIGHT: 'rgba(255, 215, 0, 0.1)',
  WARNING_BORDER: 'rgba(255, 215, 0, 0.3)',
  
  ERROR: '#FF4444',
  ERROR_LIGHT: 'rgba(255, 68, 68, 0.1)',
  
  // Cores de borda
  BORDER: 'rgba(109, 68, 255, 0.3)',
  BORDER_LIGHT: 'rgba(255, 255, 255, 0.1)',
  
  // Cores de destaque
  HIGHLIGHT: '#FFD700', // Dourado
};

export const SPACING = {
  VERYTINY: 2,
  TINY: 4,
  SMALL: 8,
  MEDIUM: 12,
  BASE: 16,
  LARGE: 20,
  XLARGE: 24,
  XXLARGE: 32,
};

export const FONTS = {
  SIZES: {
    TINY: 12,
    SMALL: 14,
    MEDIUM: 16,
    LARGE: 18,
    XLARGE: 20,
    XXLARGE: 24,
    TITLE: 32,
  },
  WEIGHTS: {
    REGULAR: '400',
    MEDIUM: '500',
    SEMIBOLD: '600',
    BOLD: '700',
  },
};

export const SHADOWS = {
  SMALL: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  MEDIUM: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 6,
  },
  LARGE: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  },
  PRIMARY: {
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
};

export const CARD_STYLES = {
  DEFAULT: {
    backgroundColor: COLORS.BACKGROUND_DARK,
    borderRadius: 15,
    padding: SPACING.LARGE,
    marginBottom: SPACING.SMALL,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  PRIMARY: {
    backgroundColor: 'rgba(109, 68, 255, 0.2)',
    borderRadius: 15,
    padding: SPACING.LARGE,
    marginBottom: SPACING.LARGE,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  SUCCESS: {
    backgroundColor: COLORS.SUCCESS_LIGHT,
    borderRadius: 15,
    padding: SPACING.LARGE,
    marginBottom: SPACING.MEDIUM,
    borderWidth: 1,
    borderColor: COLORS.SUCCESS_BORDER,
  },
  WARNING: {
    backgroundColor: COLORS.WARNING_LIGHT,
    borderRadius: 15,
    padding: SPACING.LARGE,
    marginBottom: SPACING.LARGE,
    borderWidth: 1,
    borderColor: COLORS.WARNING_BORDER,
  },
};

export const BUTTON_STYLES = {
  PRIMARY: {
    backgroundColor: COLORS.PRIMARY_LIGHT,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 12,
    padding: SPACING.MEDIUM,
  },
  SECONDARY: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
    borderRadius: 12,
    padding: SPACING.MEDIUM,
  },
};

// Adicionando os estilos de input ao tema global
export const INPUT_STYLES = {
  CONTAINER: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(32, 178, 170, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 20,
    height: 55,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 0,
  },
  TEXT: {
    flex: 1,
    color: COLORS.TEXT_PRIMARY,
    marginLeft: 10,
    fontSize: FONTS.SIZES.MEDIUM,
  },
  ICON: {
    color: COLORS.TEXT_TERTIARY,
    marginRight: 10,
  },
  ERROR: {
    color: COLORS.ERROR,
    fontSize: FONTS.SIZES.TINY,
    marginTop: 4,
    marginLeft: 10,
  },
  FOCUS: {
    borderColor: COLORS.PRIMARY_LIGHT,
  },
  DISABLED: {
    opacity: 0.5,
  }
};

export default {
  COLORS,
  SPACING,
  FONTS,
  SHADOWS,
  CARD_STYLES,
  BUTTON_STYLES,
  INPUT_STYLES,
}; 