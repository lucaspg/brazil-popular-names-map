const fetch = require('node-fetch');
fs = require('fs');

const years = [1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010]

const regions = [
    {
        'id': 12,
        'uf': 'AC'
    },
    {
        'id':27,
        'uf': 'AL'
    },
    {
        'id':16,
        'uf': 'AP'
    },
    {
        'id':13,
        'uf': 'AM'
    },
    {
        'id':29,
        'uf': 'BA'
    },
    {
        'id':23,
        'uf': 'CE'
    },
    {
        'id':53,
        'uf': 'DF'
    },
    {
        'id':32,
        'uf': 'ES'
    },
    {
        'id':52,
        'uf': 'GO'
    },
    {
        'id':21,
        'uf': 'MA'
    },
    {
        'id':51,
        'uf': 'MT'
    },
    {
        'id':50,
        'uf': 'MS'
    },
    {
        'id':31,
        'uf': 'MG'
    },
    {
        'id':15,
        'uf': 'PA'
    },
    {
        'id':25,
        'uf': 'PB'
    },
    {
        'id':41,
        'uf': 'PR'
    },
    {
        'id':26,
        'uf': 'PE'
    },
    {
        'id':22,
        'uf': 'PI'
    },
    {
        'id':33,
        'uf': 'RJ'
    },
    {
        'id':24,
        'uf': 'RN'
    },
    {
        'id':43,
        'uf': 'RS'
    },
    {
        'id':11,
        'uf': 'RO'
    },
    {
        'id':14,
        'uf': 'RR'
    },
    {
        'id':42,
        'uf': 'SC'
    },
    {
        'id':35,
        'uf': 'SP'
    },
    {
        'id':28,
        'uf': 'SE'
    },
    {
        'id':17,
        'uf': 'TO'
    }
];

const fetchRankBy = async (sex, year, region) => {
    const url = `https://servicodados.ibge.gov.br/api/v1/censos/nomes/faixa?qtd=10&faixa=${year}&sexo=${sex}&regiao=${region.id}`;

    let json = '';
    try {
        const response = await fetch(url)
        json = await response.json()
    } catch (error) {
        console.log(`Couldn't fetch rank for ${sex} - ${year} - ${JSON.stringify(region.id)}`)
        console.error(error);
    }

    const result = {}
    result[region.uf] = json.map((nameInfo) => nameInfo.nome)
    return result;
}

const getRegionRanksByYearAndSex = async (sex, year) => {
    const result = await Promise.all(regions.map(async (region) => {
        return await fetchRankBy(sex, year, region);
    }));
    const regionRanks = {};
    regionRanks[year] = result.reduce((acumulator, currentValue) => ({ ...acumulator, ...currentValue }), {});
    return regionRanks;
}

const getYearRanksBySex = async (sex) => {
    const result = await Promise.all(years.map(async (year) => {
        return await getRegionRanksByYearAndSex(sex, year, regions);
    }));
    return JSON.stringify(result.reduce((acumulator, currentValue) => ({ ...acumulator, ...currentValue }), {}));
}

const writeFile = (fileName, content) => {
    fs.writeFile(fileName, content, function (err) {
        if (err) return console.log(err);
    })
}

const write = async () => {
    const maleData = await getYearRanksBySex('m');
    writeFile('male-data.json', maleData);

    const femaleData = await getYearRanksBySex('f');
    writeFile('female-data.json', femaleData);
}

write();