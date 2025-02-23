/*******************
 * astroChart.js
********************/
import swisseph from 'swisseph';

// Ajuste o caminho onde estão seus arquivos de efemérides.
// Em React Native, você terá que resolver como disponibilizar estes arquivos.
// Se não conseguir apontar com caminho de arquivo normal, pode ser que precise
// usar uma abordagem com assets, ou até usar a versão de WASM.
swisseph.swe_set_ephe_path('./ephe'); 

// Arrays e objetos de suporte
const SIGNS = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
];

const PLANETS = [
  {
    name: "Sun",
    code: "c7a12de4-6927-4e9e-b3ce-f54091207328",
    id: swisseph.SE_SUN
  },
  {
    name: "Moon",
    code: "6baea74c-302d-41ee-b95a-8ac4ebdd4af3",
    id: swisseph.SE_MOON
  },
  {
    name: "Mercury",
    code: "0f56be79-48f8-4e25-9a5f-9ca8f5bd526a",
    id: swisseph.SE_MERCURY
  },
  {
    name: "Venus",
    code: "daba96b7-affd-477d-a07c-255a421ac99e",
    id: swisseph.SE_VENUS
  },
  {
    name: "Mars",
    code: "24efef7b-452b-4c33-b962-ccbd8e7fb5c0",
    id: swisseph.SE_MARS
  },
  {
    name: "Jupiter",
    code: "050f3c8e-c67c-4221-8830-61e57f62cd83",
    id: swisseph.SE_JUPITER
  },
  {
    name: "Saturn",
    code: "ff9c1aed-2be3-464f-99ba-e0690c80fdd4",
    id: swisseph.SE_SATURN
  },
  {
    name: "Uranus",
    code: "cc02e5b5-713e-4572-9c85-c59d7f47a537",
    id: swisseph.SE_URANUS
  },
  {
    name: "Neptune",
    code: "d587179e-1946-42e4-86b7-473955fae70a",
    id: swisseph.SE_NEPTUNE
  },
  {
    name: "Pluto",
    code: "33d31f7d-70f4-4344-bb36-8f1067c1346f",
    id: swisseph.SE_PLUTO
  },
];

const OTHER_CODES = {
  Ascendant: "fdbfa41a-00bb-4eb3-b28d-2451064eb2b4",
  Descendant: "1df8210e-6857-4c94-b45c-90781ff4046f",
  Midheaven: "9dcf52fa-7547-4c5e-aa21-0a534b5caa19",
  Nadir: "e3e8fc60-9831-4239-9fbd-00e4127194b5",
};

const SIGN_CODES = {
  "aries": "87a8841f-4676-4fd0-aa0f-d6262ef6f1e3",
  "taurus": "b3bfac70-ae9f-4905-b8d5-7570e7325ddf",
  "gemini": "bb1ff2f7-d04a-41da-9eed-6bc5c5a264a1",
  "cancer": "4e1a6f05-4ce6-4b6c-ace3-3d8ae1ee812f",
  "leo": "e2b02501-a0f0-4e51-afde-15773664a76c",
  "virgo": "e464588b-9abf-4d19-9357-119121280709",
  "libra": "94524b63-f14b-4e09-8a15-74e05fc63543",
  "scorpio": "47b8aacd-8e68-4b91-854b-a3fb347dcd02",
  "sagittarius": "6fcf26bd-328e-40ef-8fb4-1a5337d19434",
  "capricorn": "541ed12b-cf07-4b08-9a38-e09b4d420bbd",
  "aquarius": "910f2228-e86a-49ba-a731-1cf75db022de",
  "pisces": "30c6b094-679f-4b19-885f-9779c5214c61",
};

// Converte grau em signo
function degreeToSign(degree) {
  const signIndex = Math.floor(degree / 30);
  return SIGNS[signIndex];
}

// Calcula o Julian Day, levando em conta fuso horário (utcOffset)
function calculateJulianDay({ year, month, day, hour, minute, utcOffset }) {
  return new Promise((resolve, reject) => {
    try {
      // Ex.: se o utcOffset for -3, hora local 14:00 => UTC = 17:00
      const dateLocal = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
      dateLocal.setHours(dateLocal.getHours() - utcOffset);

      const finalYear = dateLocal.getUTCFullYear();
      const finalMonth = dateLocal.getUTCMonth() + 1;
      const finalDay = dateLocal.getUTCDate();
      // Hora em decimal
      const finalHour = dateLocal.getUTCHours() + (dateLocal.getUTCMinutes() / 60);

      swisseph.swe_julday(
        finalYear,
        finalMonth,
        finalDay,
        finalHour,
        swisseph.SE_GREG_CAL,
        (julday_ut) => {
          resolve(julday_ut);
        }
      );
    } catch (error) {
      reject(error);
    }
  });
}

// Calcula posições dos planetas
function getPlanetPositions(julianDay) {
  return new Promise((resolve, reject) => {
    const results = [];
    let remaining = PLANETS.length;
    const flag = swisseph.SEFLG_SPEED;

    PLANETS.forEach((planetData) => {
      swisseph.swe_calc_ut(julianDay, planetData.id, flag, (body) => {
        if (body.error) {
          // Se der erro, você decide se retorna parcial ou falha de vez
          console.error(`Erro ao calcular ${planetData.name}:`, body.error);
        } else {
          const rawDegree = body.longitude; 
          const sign = degreeToSign(rawDegree);
          results.push({
            planet: planetData.name,
            degree: (rawDegree % 30).toFixed(2),
            sign: sign,
            astral_entity_code: planetData.code,
            sign_code: SIGN_CODES[sign]
          });
        }
        remaining--;
        if (remaining === 0) {
          resolve(results);
        }
      });
    });
  });
}

// Calcula casas (Asc, Desc, MC, IC etc.)
function getHouses(julianDay, latitude, longitude) {
  return new Promise((resolve, reject) => {
    // Sistema de casas Placidus = 'P'
    const houseSystem = 'P';
    swisseph.swe_houses(julianDay, latitude, longitude, houseSystem, (housesInfo) => {
      if (housesInfo.error) {
        return reject(housesInfo.error);
      }
      const houses = housesInfo.house; // array de 12 casas
      if (!houses || houses.length < 12) {
        return reject("Não foi possível calcular as casas.");
      }

      // Ascendant é a cuspide da casa 1
      const ascDegree = houses[0];
      const ascSign = degreeToSign(ascDegree);

      // Descendant
      const descDegree = (ascDegree + 180) % 360;
      const descSign = degreeToSign(descDegree);

      // Midheaven (cuspide da casa 10 => houses[9])
      const mcDegree = houses[9];
      const mcSign = degreeToSign(mcDegree);

      // Nadir
      const nadirDegree = (mcDegree + 180) % 360;
      const nadirSign = degreeToSign(nadirDegree);

      const result = {
        houses: houses.map((deg, i) => {
          return [
            i + 1,
            (deg % 30).toFixed(2),
            degreeToSign(deg)
          ];
        }),
        ascendant: {
          degree: ascDegree.toFixed(2),
          sign: ascSign,
          sign_code: SIGN_CODES[ascSign],
          astral_entity_code: OTHER_CODES.Ascendant,
        },
        descendant: {
          degree: descDegree.toFixed(2),
          sign: descSign,
          sign_code: SIGN_CODES[descSign],
          astral_entity_code: OTHER_CODES.Descendant,
        },
        midheaven: {
          degree: mcDegree.toFixed(2),
          sign: mcSign,
          sign_code: SIGN_CODES[mcSign],
          astral_entity_code: OTHER_CODES.Midheaven,
        },
        nadir: {
          degree: nadirDegree.toFixed(2),
          sign: nadirSign,
          sign_code: SIGN_CODES[nadirSign],
          astral_entity_code: OTHER_CODES.Nadir,
        }
      };

      resolve(result);
    });
  });
}

// Função principal que retorna o objeto final
export async function createAstrologicalChart(params) {
  // Parâmetros esperados:
  // {
  //   year, month, day,
  //   hour, minute, utcOffset, (pode ser decimal se precisar),
  //   latitude, longitude
  // }

  // 1) Calcular o Julian Day
  const julday = await calculateJulianDay(params);

  // 2) Calcular posições planetárias
  const planetList = await getPlanetPositions(julday);

  // 3) Montar o objeto base
  let result = {
    astral_entities: planetList,
    houses: [],
    ascendant: null,
    descendant: null,
    midheaven: null,
    nadir: null,
    codes: {
      astral_entities: PLANETS.reduce((acc, p) => {
        acc[p.name] = p.code;
        return acc;
      }, {}),
      signs: SIGN_CODES
    }
  };

  // 4) Se tiver hour/minute, calcular casas
  if (params.hour != null && params.minute != null) {
    const housesData = await getHouses(julday, params.latitude, params.longitude);
    result.houses = housesData.houses;
    result.ascendant = housesData.ascendant;
    result.descendant = housesData.descendant;
    result.midheaven = housesData.midheaven;
    result.nadir = housesData.nadir;
  }

  return result;
}
