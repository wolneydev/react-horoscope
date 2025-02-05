/**
 * Formata números menores que 10 adicionando um zero à esquerda
 * @param {number} number - Número a ser formatado
 * @returns {string} Número formatado com dois dígitos
 */
export const formatNumber = (number) => {
  return number < 10 ? `0${number}` : number;
};

/**
 * Formata data completa de nascimento
 * @param {Object} data - Objeto contendo dados de nascimento
 * @param {number} data.birth_day - Dia do nascimento
 * @param {number} data.birth_month - Mês do nascimento
 * @param {number} data.birth_year - Ano do nascimento
 * @param {number} data.birth_hour - Hora do nascimento
 * @param {number} data.birth_minute - Minuto do nascimento
 * @param {string} data.birth_city - Cidade do nascimento
 * @returns {string} Data formatada completa
 */
export const formatBirthDate = (data) => {
  return `Nascido(a) em ${data.birth_city}, ${formatNumber(data.birth_day)}/${formatNumber(data.birth_month)}/${data.birth_year} às ${formatNumber(data.birth_hour)}:${formatNumber(data.birth_minute)}`;
}; 