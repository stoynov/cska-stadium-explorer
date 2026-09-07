import { factSources } from './config/fact-sources'
export type StadiumFact = {
  value: string
  title: string
  text: string
  source: keyof typeof factSources
}
export const stadiumFacts: Record<'bg' | 'en', StadiumFact[][]> = {
  bg: [
    [
      {
        value: '18 540',
        title: 'За българското първенство',
        text: 'Обявен капацитет на проекта. За европейски мачове официалният сайт посочва 16 819 места.',
        source: 'project',
      },
      {
        value: '100%',
        title: 'Покрити седящи места',
        text: 'Козирката е предвидена над всички седящи места; игралното поле остава открито.',
        source: 'project',
      },
      {
        value: '≈ 560 м²',
        title: 'Клубен музей',
        text: 'Планиран на ниво Бронз в сектор А, с връзка към двуетажния фен магазин.',
        source: 'hospitality',
      },
    ],
    [
      {
        value: '5 617',
        title: 'Сектор Г',
        text: 'Обявен капацитет за вътрешни мачове; 4 835 седящи места за срещи под егидата на УЕФА.',
        source: 'sectors',
      },
      {
        value: '4 742',
        title: 'Сектор В',
        text: 'Червени сгъваеми седалки и пет зрителски входа според клубното представяне от март 2026 г.',
        source: 'sectors',
      },
      {
        value: 'Достъп',
        title: 'Места за хора с увреждания',
        text: 'Предвидени са зони в двата ъгъла на сектор Г и в сектор Б. Гостуващата публика има отделен вход.',
        source: 'sectors',
      },
    ],
    [
      {
        value: '95 / 5',
        title: 'Хибридна тревна настилка',
        text: 'Обявеното съотношение е 95% естествена и 5% изкуствена трева.',
        source: 'sectors',
      },
      {
        value: '12',
        title: 'Сензора за почвата',
        text: 'Планирано следене на влажност, температура, соли и кислород за управление на условията около корените.',
        source: 'pitch',
      },
      {
        value: 'SIS',
        title: 'Активен дренаж',
        text: 'Проектът със SIS Pitches включва отвеждане на вода, аерация, отопление и напояване.',
        source: 'pitch',
      },
    ],
    [
      {
        value: '4',
        title: 'Нива над футболната зона',
        text: 'В сектор А са представени Бронз, Силвър, Голд и Платинум — с различни зрителски и гостоприемни пространства.',
        source: 'hospitality',
      },
      {
        value: '20 + 8',
        title: 'Скайбоксове',
        text: 'Проектът предвижда 20 ложи на ниво Голд и 8 на Платинум, със собствени външни тераси.',
        source: 'hospitality',
      },
      {
        value: 'Слънце',
        title: 'Енергия от покрива',
        text: 'Соларни панели и LED осветление са част от енергийната концепция.',
        source: 'project',
      },
    ],
    [
      {
        value: '40 дка',
        title: 'За обществено ползване',
        text: 'Проектът предвижда връщане на площи към парка с нови алеи и озеленяване.',
        source: 'project',
      },
      {
        value: '300+',
        title: 'Нови дървета',
        text: 'Обявено планирано засаждане около реконструирания стадион.',
        source: 'project',
      },
      {
        value: 'Амфитеатър',
        title: 'Спомен за стария сектор Г',
        text: 'Пред Северната трибуна са представени свободно достъпни стъпаловидни места и видеостена срещу тях.',
        source: 'sectors',
      },
      {
        value: '106 м',
        title: 'Телевизионна кула „София“',
        text: 'Построена през 1959 г. по проект на арх. Любен Попдонев. Това е старата кула в Борисовата градина.',
        source: 'tower',
      },
      {
        value: '2 290 м',
        title: 'Черни връх',
        text: 'Най-високият връх на Витоша. Планината се издига южно от София.',
        source: 'vitosha',
      },
    ],
    [
      {
        value: 'София',
        title: 'Адрес и подход',
        text: 'Борисова градина, бул. „Драган Цанков“ 3. Главният вход към сектор А е на мястото на стария вход.',
        source: 'project',
      },
      {
        value: 'Транспорт',
        title: 'Планирай пътуването',
        text: 'Клубът насочва към градски транспорт и обществените паркинги в района. Проверявай организацията за конкретното събитие.',
        source: 'project',
      },
      {
        value: 'Преди мач',
        title: 'Билети и достъп',
        text: 'Следи официалните съобщения на ЦСКА за откриване, продажби и входове. Проектните удобства не означават, че вече приемат посетители.',
        source: 'project',
      },
    ],
  ],
  en: [
    [
      {
        value: '18,540',
        title: 'Domestic competition capacity',
        text: 'Published project capacity. The stadium website lists 16,819 places for European matches.',
        source: 'project',
      },
      {
        value: '100%',
        title: 'Covered seating',
        text: 'The canopy is designed to cover all seated spectators, while the playing field remains open.',
        source: 'project',
      },
      {
        value: '≈ 560 m²',
        title: 'Club museum',
        text: 'Planned on the Bronze level of Stand A, connected to the two-storey fan shop.',
        source: 'hospitality',
      },
    ],
    [
      {
        value: '5,617',
        title: 'Stand G',
        text: 'Published domestic capacity, with 4,835 seated places for UEFA fixtures.',
        source: 'sectors',
      },
      {
        value: '4,742',
        title: 'Stand V',
        text: 'Red folding seats and five spectator entrances, as presented by the club in March 2026.',
        source: 'sectors',
      },
      {
        value: 'Access',
        title: 'Accessible viewing areas',
        text: 'Areas are planned in both corners of Stand G and in Stand B. Away supporters have a separate entrance.',
        source: 'sectors',
      },
    ],
    [
      {
        value: '95 / 5',
        title: 'Hybrid playing surface',
        text: 'The announced mix is 95% natural grass and 5% artificial reinforcement.',
        source: 'sectors',
      },
      {
        value: '12',
        title: 'Soil sensors',
        text: 'Planned monitoring of moisture, temperature, salts and oxygen helps control the root-zone conditions.',
        source: 'pitch',
      },
      {
        value: 'SIS',
        title: 'Active drainage',
        text: 'The SIS Pitches project includes water removal, aeration, heating and irrigation.',
        source: 'pitch',
      },
    ],
    [
      {
        value: '4',
        title: 'Levels above the football zone',
        text: 'Stand A features Bronze, Silver, Gold and Platinum levels with different spectator and hospitality spaces.',
        source: 'hospitality',
      },
      {
        value: '20 + 8',
        title: 'Skyboxes',
        text: 'Plans include 20 boxes on Gold and 8 on Platinum, with their own outdoor terraces.',
        source: 'hospitality',
      },
      {
        value: 'Solar',
        title: 'Energy from the roof',
        text: 'Solar panels and LED lighting form part of the energy concept.',
        source: 'project',
      },
    ],
    [
      {
        value: '4 ha',
        title: 'For public use',
        text: 'The project proposes returning land to the park with paths and landscaping.',
        source: 'project',
      },
      {
        value: '300+',
        title: 'New trees',
        text: 'Announced planting target around the reconstructed stadium.',
        source: 'project',
      },
      {
        value: 'Amphitheatre',
        title: 'A memory of the old Stand G',
        text: 'Public stepped seating and an opposite video wall are presented outside the North Stand.',
        source: 'sectors',
      },
      {
        value: '106 m',
        title: 'Sofia Television Tower',
        text: 'Built in 1959 to a design by architect Lyuben Popdonev. This is the old tower in Borisova Gradina.',
        source: 'tower',
      },
      {
        value: '2,290 m',
        title: 'Cherni Vrah',
        text: 'The highest peak of Vitosha, the mountain rising to the south of Sofia.',
        source: 'vitosha',
      },
    ],
    [
      {
        value: 'Sofia',
        title: 'Address and approach',
        text: 'Borisova Gradina, 3 Dragan Tsankov Boulevard. The main Stand A entrance occupies the original entrance location.',
        source: 'project',
      },
      {
        value: 'Transport',
        title: 'Plan your journey',
        text: 'The club points visitors towards public transport and nearby public parking. Check arrangements for your particular event.',
        source: 'project',
      },
      {
        value: 'Matchday',
        title: 'Tickets and entry',
        text: 'Follow CSKA announcements for opening, ticket sales and gate details. Planned facilities are not confirmation of visitor access.',
        source: 'project',
      },
    ],
  ],
}
