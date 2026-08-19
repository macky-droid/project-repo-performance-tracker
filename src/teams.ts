
export interface PlayerGoals {
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
}

export interface Team {
  name: string;
  shortName: string;
  roster: string[];
  numbers: Record<string, string>;
  positions: Record<string, string>;
  goals: Record<string, PlayerGoals>;
  colors: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
}

export const TEAM_DATA: Record<string, Team> = {
  'OKC Thunder': {
    name: 'Oklahoma City Thunder',
    shortName: 'OKC',
    roster: ['Shai Gilgeous-Alexander', 'Chet Holmgren', 'Jalen Williams', 'Luguentz Dort', 'Alex Caruso', 'Isaiah Hartenstein', 'Cason Wallace', 'Isaiah Joe', 'Aaron Wiggins', 'Nikola Topic', 'Jared McCain', 'Jaylin Williams', 'Kenrich Williams', 'Ajay Mitchell', 'Brooks Barnhizer', 'Branden Carlson', 'Payton Sandfort', 'Thomas Sorber'],
    numbers: { 
      'Shai Gilgeous-Alexander': '2', 
      'Chet Holmgren': '7', 
      'Jalen Williams': '8', 
      'Luguentz Dort': '5', 
      'Alex Caruso': '9', 
      'Isaiah Hartenstein': '55', 
      'Cason Wallace': '22', 
      'Isaiah Joe': '11', 
      'Aaron Wiggins': '21',
      'Nikola Topic': '44',
      'Jared McCain': '3',
      'Jaylin Williams': '6',
      'Kenrich Williams': '34',
      'Ajay Mitchell': '25',
      'Brooks Barnhizer': '23',
      'Branden Carlson': '15',
      'Payton Sandfort': '14',
      'Thomas Sorber': '12'
    },
    positions: { 
      'Shai Gilgeous-Alexander': 'Guard', 
      'Chet Holmgren': 'Center', 
      'Jalen Williams': 'Guard', 
      'Luguentz Dort': 'Guard', 
      'Alex Caruso': 'Guard', 
      'Isaiah Hartenstein': 'Center', 
      'Cason Wallace': 'Guard', 
      'Isaiah Joe': 'Guard', 
      'Aaron Wiggins': 'Guard',
      'Nikola Topic': 'Guard',
      'Jared McCain': 'Guard',
      'Jaylin Williams': 'Forward',
      'Kenrich Williams': 'Guard',
      'Ajay Mitchell': 'Guard',
      'Brooks Barnhizer': 'Forward',
      'Branden Carlson': 'Center',
      'Payton Sandfort': 'Forward',
      'Thomas Sorber': 'Center'
    },
    goals: {
      'Shai Gilgeous-Alexander': { points: 31.1, rebounds: 6, assists: 7, steals: 2, blocks: 1 },
      'Chet Holmgren': { points: 20, rebounds: 10, assists: 3, steals: 1, blocks: 3 },
      'Jalen Williams': { points: 22, rebounds: 5, assists: 5, steals: 1, blocks: 1 },
      'Luguentz Dort': { points: 13, rebounds: 4, assists: 2, steals: 1, blocks: 1 },
      'Alex Caruso': { points: 10, rebounds: 4, assists: 4, steals: 2, blocks: 1 },
      'Isaiah Hartenstein': { points: 11, rebounds: 11, assists: 3, steals: 1, blocks: 1 },
      'Cason Wallace': { points: 10, rebounds: 3, assists: 3, steals: 1, blocks: 0 },
      'Isaiah Joe': { points: 11, rebounds: 2, assists: 1, steals: 1, blocks: 0 },
      'Aaron Wiggins': { points: 10, rebounds: 3, assists: 2, steals: 1, blocks: 0 },
      'Nikola Topic': { points: 12, rebounds: 4, assists: 6, steals: 1, blocks: 0 },
      'Jared McCain': { points: 14, rebounds: 3, assists: 3, steals: 1, blocks: 0 },
      'Jaylin Williams': { points: 8, rebounds: 5, assists: 2, steals: 1, blocks: 1 },
      'Kenrich Williams': { points: 7, rebounds: 4, assists: 2, steals: 1, blocks: 0 },
      'Ajay Mitchell': { points: 9, rebounds: 2, assists: 3, steals: 1, blocks: 0 },
      'Brooks Barnhizer': { points: 8, rebounds: 4, assists: 2, steals: 1, blocks: 0 },
      'Branden Carlson': { points: 7, rebounds: 5, assists: 1, steals: 0, blocks: 1 },
      'Payton Sandfort': { points: 10, rebounds: 5, assists: 2, steals: 1, blocks: 0 },
      'Thomas Sorber': { points: 6, rebounds: 6, assists: 1, steals: 0, blocks: 2 }
    },
    colors: { primary: 'bg-blue-500', secondary: 'bg-orange-500', tertiary: 'bg-slate-900' }
  },
  'San Antonio Spurs': {
    name: 'San Antonio Spurs',
    shortName: 'SAS',
    roster: ['De\'Aaron Fox', 'Stephon Castle', 'Devin Vassell', 'Harrison Barnes', 'Victor Wembanyama', 'Dylan Harper', 'Keldon Johnson', 'Kelly Olynyk', 'Luke Kornet', 'Julian Champagnie', 'Bismack Biyombo', 'Carter Bryant', 'Harrison Ingram', 'David Jones Garcia', 'Jordan McLaughlin', 'Emanuel Miller', 'Mason Plumlee', 'Lindy Waters III'],
    numbers: { 
      'Victor Wembanyama': '1', 
      'Devin Vassell': '24', 
      'De\'Aaron Fox': '4', 
      'Stephon Castle': '5', 
      'Dylan Harper': '2', 
      'Keldon Johnson': '3', 
      'Harrison Barnes': '40', 
      'Kelly Olynyk': '8', 
      'Luke Kornet': '7', 
      'Julian Champagnie': '30', 
      'Bismack Biyombo': '18', 
      'Carter Bryant': '11', 
      'Harrison Ingram': '55', 
      'David Jones Garcia': '25', 
      'Jordan McLaughlin': '0', 
      'Emanuel Miller': '14', 
      'Mason Plumlee': '45', 
      'Lindy Waters III': '43' 
    },
    positions: { 
      'Victor Wembanyama': 'Forward', 
      'Devin Vassell': 'Guard', 
      'De\'Aaron Fox': 'Guard', 
      'Stephon Castle': 'Guard', 
      'Dylan Harper': 'Guard', 
      'Keldon Johnson': 'Forward', 
      'Harrison Barnes': 'Forward', 
      'Kelly Olynyk': 'Forward', 
      'Luke Kornet': 'Center', 
      'Julian Champagnie': 'Forward', 
      'Bismack Biyombo': 'Center', 
      'Carter Bryant': 'Forward', 
      'Harrison Ingram': 'Forward', 
      'David Jones Garcia': 'Forward', 
      'Jordan McLaughlin': 'Guard', 
      'Emanuel Miller': 'Forward', 
      'Mason Plumlee': 'Center', 
      'Lindy Waters III': 'Forward' 
    },
    goals: {
      'Victor Wembanyama': { points: 31, rebounds: 20.5, assists: 6, steals: 1, blocks: 4 },
      'Devin Vassell': { points: 22, rebounds: 5, assists: 5, steals: 1, blocks: 0 },
      'De\'Aaron Fox': { points: 26, rebounds: 4, assists: 8, steals: 2, blocks: 0 },
      'Stephon Castle': { points: 16, rebounds: 6, assists: 6, steals: 2, blocks: 1 },
      'Dylan Harper': { points: 18, rebounds: 5, assists: 5, steals: 1, blocks: 0 },
      'Keldon Johnson': { points: 15, rebounds: 6, assists: 2, steals: 1, blocks: 0 },
      'Harrison Barnes': { points: 12, rebounds: 5, assists: 2, steals: 1, blocks: 0 },
      'Kelly Olynyk': { points: 11, rebounds: 7, assists: 4, steals: 1, blocks: 0 },
      'Luke Kornet': { points: 7, rebounds: 6, assists: 1, steals: 0, blocks: 1 },
      'Julian Champagnie': { points: 12, rebounds: 5, assists: 2, steals: 1, blocks: 0 },
      'Bismack Biyombo': { points: 4, rebounds: 7, assists: 1, steals: 0, blocks: 2 },
      'Carter Bryant': { points: 13, rebounds: 6, assists: 2, steals: 1, blocks: 1 },
      'Harrison Ingram': { points: 9, rebounds: 5, assists: 2, steals: 1, blocks: 0 },
      'David Jones Garcia': { points: 10, rebounds: 4, assists: 2, steals: 1, blocks: 0 },
      'Jordan McLaughlin': { points: 6, rebounds: 2, assists: 5, steals: 1, blocks: 0 },
      'Emanuel Miller': { points: 8, rebounds: 5, assists: 2, steals: 1, blocks: 0 },
      'Mason Plumlee': { points: 7, rebounds: 8, assists: 2, steals: 1, blocks: 1 },
      'Lindy Waters III': { points: 8, rebounds: 3, assists: 1, steals: 1, blocks: 0 }
    },
    colors: { primary: 'bg-slate-900', secondary: 'bg-slate-800', tertiary: 'bg-slate-700' }
  },
  'Boston Celtics': {
    name: 'Boston Celtics',
    shortName: 'BOS',
    roster: ['Jayson Tatum', 'Jaylen Brown', 'Kristaps Porzingis', 'Derrick White', 'Jrue Holiday', 'Payton Pritchard', 'Sam Hauser', 'Al Horford'],
    numbers: { 'Jayson Tatum': '0', 'Jaylen Brown': '7', 'Kristaps Porzingis': '8', 'Derrick White': '9', 'Jrue Holiday': '4', 'Payton Pritchard': '11', 'Sam Hauser': '30', 'Al Horford': '42' },
    positions: { 'Jayson Tatum': 'Forward', 'Jaylen Brown': 'Forward', 'Kristaps Porzingis': 'Center', 'Derrick White': 'Guard', 'Jrue Holiday': 'Guard', 'Payton Pritchard': 'Guard', 'Sam Hauser': 'Forward', 'Al Horford': 'Center' },
    goals: {
      'Jayson Tatum': { points: 28, rebounds: 8, assists: 5, steals: 1, blocks: 1 },
      'Jaylen Brown': { points: 25, rebounds: 6, assists: 4, steals: 1, blocks: 0 },
      'Kristaps Porzingis': { points: 18, rebounds: 7, assists: 2, steals: 1, blocks: 2 },
      'Derrick White': { points: 16, rebounds: 4, assists: 5, steals: 1, blocks: 1 },
      'Jrue Holiday': { points: 12, rebounds: 5, assists: 5, steals: 1, blocks: 1 },
      'Payton Pritchard': { points: 10, rebounds: 3, assists: 4, steals: 1, blocks: 0 },
      'Sam Hauser': { points: 9, rebounds: 3, assists: 1, steals: 1, blocks: 0 },
      'Al Horford': { points: 8, rebounds: 6, assists: 3, steals: 1, blocks: 1 }
    },
    colors: { primary: 'bg-green-700', secondary: 'bg-green-900', tertiary: 'bg-slate-900' }
  },
  'Minnesota Timberwolves': {
    name: 'Minnesota Timberwolves',
    shortName: 'MIN',
    roster: ['Kyle Anderson', 'Joan Beringer', 'Jaylen Clark', 'Mike Conley', 'Donte DiVincenzo', 'Ayo Dosunmu', 'Anthony Edwards', 'Enrique Freeman', 'Rudy Gobert', 'Bones Hyland', 'Joe Ingles', 'Jaden McDaniels', 'Julian Phillips', 'Zyon Pullin', 'Julius Randle', 'Naz Reid', 'Terrence Shannon Jr.', 'Rocco Zikarsky'],
    numbers: { 'Kyle Anderson': '12', 'Joan Beringer': '19', 'Jaylen Clark': '22', 'Mike Conley': '10', 'Donte DiVincenzo': '0', 'Ayo Dosunmu': '13', 'Anthony Edwards': '5', 'Enrique Freeman': '25', 'Rudy Gobert': '27', 'Bones Hyland': '8', 'Joe Ingles': '7', 'Jaden McDaniels': '3', 'Julian Phillips': '4', 'Zyon Pullin': '15', 'Julius Randle': '30', 'Naz Reid': '11', 'Terrence Shannon Jr.': '1', 'Rocco Zikarsky': '44' },
    positions: { 'Kyle Anderson': 'Forward', 'Joan Beringer': 'Forward', 'Jaylen Clark': 'Guard', 'Mike Conley': 'Guard', 'Donte DiVincenzo': 'Guard', 'Ayo Dosunmu': 'Guard', 'Anthony Edwards': 'Guard', 'Enrique Freeman': 'Forward', 'Rudy Gobert': 'Center', 'Bones Hyland': 'Guard', 'Joe Ingles': 'Forward', 'Jaden McDaniels': 'Forward', 'Julian Phillips': 'Forward', 'Zyon Pullin': 'Guard', 'Julius Randle': 'Forward', 'Naz Reid': 'Center', 'Terrence Shannon Jr.': 'Guard', 'Rocco Zikarsky': 'Center' },
    goals: {
      'Kyle Anderson': { points: 8, rebounds: 5, assists: 4, steals: 1, blocks: 1 },
      'Joan Beringer': { points: 6, rebounds: 4, assists: 1, steals: 1, blocks: 1 },
      'Jaylen Clark': { points: 8, rebounds: 3, assists: 2, steals: 1, blocks: 0 },
      'Mike Conley': { points: 10, rebounds: 3, assists: 6, steals: 1, blocks: 0 },
      'Donte DiVincenzo': { points: 14, rebounds: 4, assists: 3, steals: 1, blocks: 0 },
      'Ayo Dosunmu': { points: 13, rebounds: 3, assists: 3, steals: 1, blocks: 0 },
      'Anthony Edwards': { points: 31, rebounds: 6, assists: 6, steals: 2, blocks: 1 },
      'Enrique Freeman': { points: 7, rebounds: 5, assists: 1, steals: 1, blocks: 1 },
      'Rudy Gobert': { points: 12, rebounds: 13, assists: 2, steals: 1, blocks: 3 },
      'Bones Hyland': { points: 12, rebounds: 2, assists: 3, steals: 1, blocks: 0 },
      'Joe Ingles': { points: 8, rebounds: 3, assists: 4, steals: 1, blocks: 0 },
      'Jaden McDaniels': { points: 14, rebounds: 5, assists: 2, steals: 1, blocks: 1 },
      'Julian Phillips': { points: 9, rebounds: 4, assists: 2, steals: 1, blocks: 1 },
      'Zyon Pullin': { points: 7, rebounds: 2, assists: 3, steals: 1, blocks: 0 },
      'Julius Randle': { points: 22, rebounds: 9, assists: 5, steals: 1, blocks: 0 },
      'Naz Reid': { points: 16, rebounds: 7, assists: 2, steals: 1, blocks: 1 },
      'Terrence Shannon Jr.': { points: 12, rebounds: 3, assists: 2, steals: 1, blocks: 1 },
      'Rocco Zikarsky': { points: 8, rebounds: 8, assists: 1, steals: 0, blocks: 3 }
    },
    colors: { primary: 'bg-blue-900', secondary: 'bg-green-600', tertiary: 'bg-slate-800' }
  },
  'Denver Nuggets': {
    name: 'Denver Nuggets',
    shortName: 'DEN',
    roster: ['Nikola Jokic', 'Jamal Murray', 'Michael Porter Jr.', 'Aaron Gordon', 'Christian Braun', 'Peyton Watson', 'Russell Westbrook', 'Dario Saric'],
    numbers: { 'Nikola Jokic': '15', 'Jamal Murray': '27', 'Michael Porter Jr.': '1', 'Aaron Gordon': '50', 'Christian Braun': '0', 'Peyton Watson': '8', 'Russell Westbrook': '4', 'Dario Saric': '9' },
    positions: { 'Nikola Jokic': 'Center', 'Jamal Murray': 'Guard', 'Michael Porter Jr.': 'Forward', 'Aaron Gordon': 'Forward', 'Christian Braun': 'Guard', 'Peyton Watson': 'Forward', 'Russell Westbrook': 'Guard', 'Dario Saric': 'Forward' },
    goals: {
      'Nikola Jokic': { points: 28, rebounds: 13, assists: 10, steals: 1, blocks: 1 },
      'Jamal Murray': { points: 22, rebounds: 4, assists: 7, steals: 1, blocks: 0 },
      'Michael Porter Jr.': { points: 18, rebounds: 8, assists: 2, steals: 1, blocks: 1 },
      'Aaron Gordon': { points: 14, rebounds: 7, assists: 4, steals: 1, blocks: 1 },
      'Christian Braun': { points: 12, rebounds: 4, assists: 3, steals: 1, blocks: 0 },
      'Peyton Watson': { points: 10, rebounds: 4, assists: 2, steals: 1, blocks: 2 },
      'Russell Westbrook': { points: 10, rebounds: 5, assists: 6, steals: 1, blocks: 0 },
      'Dario Saric': { points: 8, rebounds: 5, assists: 3, steals: 1, blocks: 0 }
    },
    colors: { primary: 'bg-blue-800', secondary: 'bg-yellow-500', tertiary: 'bg-red-700' }
  },
  'Dallas Mavericks': {
    name: 'Dallas Mavericks',
    shortName: 'DAL',
    roster: ['Luka Doncic', 'Kyrie Irving', 'Klay Thompson', 'Dereck Lively II', 'P.J. Washington', 'Daniel Gafford', 'Spencer Dinwiddie', 'Naji Marshall', 'Quentin Grimes'],
    numbers: { 'Luka Doncic': '77', 'Kyrie Irving': '11', 'Klay Thompson': '31', 'Dereck Lively II': '2', 'P.J. Washington': '25', 'Daniel Gafford': '21', 'Spencer Dinwiddie': '26', 'Naji Marshall': '13', 'Quentin Grimes': '5' },
    positions: { 'Luka Doncic': 'Guard', 'Kyrie Irving': 'Guard', 'Klay Thompson': 'Forward', 'Dereck Lively II': 'Center', 'P.J. Washington': 'Forward', 'Daniel Gafford': 'Center', 'Spencer Dinwiddie': 'Guard', 'Naji Marshall': 'Forward', 'Quentin Grimes': 'Guard' },
    goals: {
      'Luka Doncic': { points: 33, rebounds: 10, assists: 10, steals: 1, blocks: 0 },
      'Kyrie Irving': { points: 25, rebounds: 5, assists: 5, steals: 1, blocks: 0 },
      'Klay Thompson': { points: 18, rebounds: 4, assists: 2, steals: 1, blocks: 0 },
      'Dereck Lively II': { points: 12, rebounds: 10, assists: 2, steals: 1, blocks: 2 },
      'P.J. Washington': { points: 14, rebounds: 6, assists: 3, steals: 1, blocks: 1 },
      'Daniel Gafford': { points: 10, rebounds: 8, assists: 1, steals: 0, blocks: 2 },
      'Spencer Dinwiddie': { points: 10, rebounds: 3, assists: 4, steals: 1, blocks: 0 },
      'Naji Marshall': { points: 8, rebounds: 4, assists: 2, steals: 1, blocks: 0 },
      'Quentin Grimes': { points: 8, rebounds: 3, assists: 2, steals: 1, blocks: 0 }
    },
    colors: { primary: 'bg-blue-700', secondary: 'bg-blue-900', tertiary: 'bg-slate-400' }
  },
  'Philadelphia 76ers': {
    name: 'Philadelphia 76ers',
    shortName: 'PHI',
    roster: ['Dominick Barlow', 'MarJon Beauchamp', 'Adem Bona', 'Johni Broome', 'Andre Drummond', 'VJ Edgecombe', 'Justin Edwards', 'Joel Embiid', 'Paul George', 'Quentin Grimes', 'Kyle Lowry', 'Tyrese Martin', 'Tyrese Maxey', 'Kelly Oubre Jr.', 'Dalen Terry', 'Jabari Walker'],
    numbers: { 'Dominick Barlow': '25', 'MarJon Beauchamp': '16', 'Adem Bona': '30', 'Johni Broome': '22', 'Andre Drummond': '1', 'VJ Edgecombe': '77', 'Justin Edwards': '11', 'Joel Embiid': '21', 'Paul George': '8', 'Quentin Grimes': '5', 'Kyle Lowry': '7', 'Tyrese Martin': '23', 'Tyrese Maxey': '0', 'Kelly Oubre Jr.': '9', 'Dalen Terry': '14', 'Jabari Walker': '33' },
    positions: { 'Dominick Barlow': 'Forward', 'MarJon Beauchamp': 'Forward', 'Adem Bona': 'Center', 'Johni Broome': 'Forward', 'Andre Drummond': 'Center', 'VJ Edgecombe': 'Guard', 'Justin Edwards': 'Forward', 'Joel Embiid': 'Center', 'Paul George': 'Forward', 'Quentin Grimes': 'Guard', 'Kyle Lowry': 'Guard', 'Tyrese Martin': 'Guard', 'Tyrese Maxey': 'Guard', 'Kelly Oubre Jr.': 'Guard', 'Dalen Terry': 'Forward', 'Jabari Walker': 'Forward' },
    goals: {
      'Dominick Barlow': { points: 8, rebounds: 5, assists: 2, steals: 1, blocks: 1 },
      'MarJon Beauchamp': { points: 10, rebounds: 4, assists: 2, steals: 1, blocks: 0 },
      'Adem Bona': { points: 6, rebounds: 6, assists: 1, steals: 1, blocks: 2 },
      'Johni Broome': { points: 12, rebounds: 8, assists: 2, steals: 1, blocks: 1 },
      'Andre Drummond': { points: 10, rebounds: 12, assists: 2, steals: 1, blocks: 1 },
      'VJ Edgecombe': { points: 15, rebounds: 4, assists: 4, steals: 1, blocks: 0 },
      'Justin Edwards': { points: 11, rebounds: 5, assists: 2, steals: 1, blocks: 1 },
      'Joel Embiid': { points: 30, rebounds: 11, assists: 6, steals: 1, blocks: 2 },
      'Paul George': { points: 22, rebounds: 6, assists: 4, steals: 2, blocks: 0 },
      'Quentin Grimes': { points: 12, rebounds: 4, assists: 3, steals: 1, blocks: 0 },
      'Kyle Lowry': { points: 8, rebounds: 3, assists: 5, steals: 1, blocks: 0 },
      'Tyrese Martin': { points: 9, rebounds: 3, assists: 2, steals: 1, blocks: 0 },
      'Tyrese Maxey': { points: 26, rebounds: 4, assists: 7, steals: 1, blocks: 0 },
      'Kelly Oubre Jr.': { points: 16, rebounds: 5, assists: 2, steals: 1, blocks: 0 },
      'Dalen Terry': { points: 8, rebounds: 4, assists: 3, steals: 1, blocks: 0 },
      'Jabari Walker': { points: 10, rebounds: 7, assists: 2, steals: 1, blocks: 1 }
    },
    colors: { primary: 'bg-blue-600', secondary: 'bg-red-600', tertiary: 'bg-white' }
  },
  'Milwaukee Bucks': {
    name: 'Milwaukee Bucks',
    shortName: 'MIL',
    roster: ['Giannis Antetokounmpo', 'Damian Lillard', 'Khris Middleton', 'Brook Lopez', 'Bobby Portis', 'Taurean Prince', 'Gary Trent Jr.', 'Delon Wright'],
    numbers: { 'Giannis Antetokounmpo': '34', 'Damian Lillard': '0', 'Khris Middleton': '22', 'Brook Lopez': '11', 'Bobby Portis': '9', 'Taurean Prince': '12', 'Gary Trent Jr.': '5', 'Delon Wright': '55' },
    positions: { 'Giannis Antetokounmpo': 'Forward', 'Damian Lillard': 'Guard', 'Khris Middleton': 'Forward', 'Brook Lopez': 'Center', 'Bobby Portis': 'Forward', 'Taurean Prince': 'Forward', 'Gary Trent Jr.': 'Guard', 'Delon Wright': 'Guard' },
    goals: {
      'Giannis Antetokounmpo': { points: 30, rebounds: 12, assists: 6, steals: 1, blocks: 1 },
      'Damian Lillard': { points: 25, rebounds: 4, assists: 7, steals: 1, blocks: 0 },
      'Khris Middleton': { points: 16, rebounds: 5, assists: 5, steals: 1, blocks: 0 },
      'Brook Lopez': { points: 12, rebounds: 5, assists: 1, steals: 0, blocks: 2 },
      'Bobby Portis': { points: 14, rebounds: 8, assists: 1, steals: 1, blocks: 0 },
      'Taurean Prince': { points: 9, rebounds: 3, assists: 2, steals: 1, blocks: 0 },
      'Gary Trent Jr.': { points: 12, rebounds: 2, assists: 1, steals: 1, blocks: 0 },
      'Delon Wright': { points: 7, rebounds: 2, assists: 3, steals: 2, blocks: 0 }
    },
    colors: { primary: 'bg-green-800', secondary: 'bg-yellow-100', tertiary: 'bg-slate-900' }
  },
  'Golden State Warriors': {
    name: 'Golden State Warriors',
    shortName: 'GSW',
    roster: ['Stephen Curry', 'Draymond Green', 'Andrew Wiggins', 'Jonathan Kuminga', 'Brandin Podziemski', 'Buddy Hield', 'Trayce Jackson-Davis', 'Kyle Anderson', 'De\'Anthony Melton'],
    numbers: { 'Stephen Curry': '30', 'Draymond Green': '23', 'Andrew Wiggins': '22', 'Jonathan Kuminga': '00', 'Brandin Podziemski': '2', 'Buddy Hield': '7', 'Trayce Jackson-Davis': '32', 'Kyle Anderson': '1', 'De\'Anthony Melton': '8' },
    positions: { 'Stephen Curry': 'Guard', 'Draymond Green': 'Forward', 'Andrew Wiggins': 'Forward', 'Jonathan Kuminga': 'Forward', 'Brandin Podziemski': 'Guard', 'Buddy Hield': 'Guard', 'Trayce Jackson-Davis': 'Center', 'Kyle Anderson': 'Forward', 'De\'Anthony Melton': 'Guard' },
    goals: {
      'Stephen Curry': { points: 28, rebounds: 5, assists: 6, steals: 1, blocks: 0 },
      'Draymond Green': { points: 10, rebounds: 7, assists: 8, steals: 2, blocks: 1 },
      'Andrew Wiggins': { points: 16, rebounds: 5, assists: 2, steals: 1, blocks: 1 },
      'Jonathan Kuminga': { points: 18, rebounds: 6, assists: 3, steals: 1, blocks: 1 },
      'Brandin Podziemski': { points: 12, rebounds: 6, assists: 5, steals: 1, blocks: 0 },
      'Buddy Hield': { points: 14, rebounds: 3, assists: 2, steals: 1, blocks: 0 },
      'Trayce Jackson-Davis': { points: 10, rebounds: 7, assists: 2, steals: 1, blocks: 2 },
      'Kyle Anderson': { points: 8, rebounds: 5, assists: 4, steals: 1, blocks: 1 },
      'De\'Anthony Melton': { points: 10, rebounds: 3, assists: 3, steals: 1, blocks: 0 }
    },
    colors: { primary: 'bg-blue-600', secondary: 'bg-yellow-400', tertiary: 'bg-white' }
  },
  'Miami Heat': {
    name: 'Miami Heat',
    shortName: 'MIA',
    roster: ['Jimmy Butler', 'Bam Adebayo', 'Tyler Herro', 'Terry Rozier', 'Nikola Jovic', 'Jaime Jaquez Jr.', 'Kevin Love', 'Kel\'el Ware', 'Duncan Robinson'],
    numbers: { 'Jimmy Butler': '22', 'Bam Adebayo': '13', 'Tyler Herro': '14', 'Terry Rozier': '2', 'Nikola Jovic': '5', 'Jaime Jaquez Jr.': '11', 'Kevin Love': '42', 'Kel\'el Ware': '7', 'Duncan Robinson': '55' },
    positions: { 'Jimmy Butler': 'Forward', 'Bam Adebayo': 'Center', 'Tyler Herro': 'Guard', 'Terry Rozier': 'Guard', 'Nikola Jovic': 'Forward', 'Jaime Jaquez Jr.': 'Forward', 'Kevin Love': 'Center', 'Kel\'el Ware': 'Center', 'Duncan Robinson': 'Guard' },
    goals: {
      'Jimmy Butler': { points: 24, rebounds: 6, assists: 6, steals: 2, blocks: 0 },
      'Bam Adebayo': { points: 20, rebounds: 10, assists: 4, steals: 1, blocks: 1 },
      'Tyler Herro': { points: 21, rebounds: 5, assists: 4, steals: 1, blocks: 0 },
      'Terry Rozier': { points: 18, rebounds: 4, assists: 5, steals: 1, blocks: 0 },
      'Nikola Jovic': { points: 12, rebounds: 6, assists: 3, steals: 1, blocks: 1 },
      'Jaime Jaquez Jr.': { points: 14, rebounds: 5, assists: 3, steals: 1, blocks: 1 },
      'Kevin Love': { points: 10, rebounds: 7, assists: 2, steals: 0, blocks: 0 },
      'Kel\'el Ware': { points: 10, rebounds: 7, assists: 1, steals: 1, blocks: 2 },
      'Duncan Robinson': { points: 11, rebounds: 2, assists: 2, steals: 1, blocks: 0 }
    },
    colors: { primary: 'bg-red-800', secondary: 'bg-yellow-600', tertiary: 'bg-black' }
  },
  'Phoenix Suns': {
    name: 'Phoenix Suns',
    shortName: 'PHX',
    roster: ['Kevin Durant', 'Devin Booker', 'Bradley Beal', 'Tyus Jones', 'Jusuf Nurkic', 'Grayson Allen', 'Royce O\'Neale', 'Mason Plumlee', 'Monte Morris'],
    numbers: { 'Kevin Durant': '35', 'Devin Booker': '1', 'Bradley Beal': '3', 'Tyus Jones': '21', 'Jusuf Nurkic': '20', 'Grayson Allen': '8', 'Royce O\'Neale': '00', 'Mason Plumlee': '22', 'Monte Morris': '23' },
    positions: { 'Kevin Durant': 'Forward', 'Devin Booker': 'Guard', 'Bradley Beal': 'Guard', 'Tyus Jones': 'Guard', 'Jusuf Nurkic': 'Center', 'Grayson Allen': 'Guard', 'Royce O\'Neale': 'Forward', 'Mason Plumlee': 'Center', 'Monte Morris': 'Guard' },
    goals: {
      'Kevin Durant': { points: 27, rebounds: 6, assists: 5, steals: 1, blocks: 1 },
      'Devin Booker': { points: 27, rebounds: 5, assists: 7, steals: 1, blocks: 0 },
      'Bradley Beal': { points: 18, rebounds: 4, assists: 5, steals: 1, blocks: 0 },
      'Tyus Jones': { points: 12, rebounds: 3, assists: 7, steals: 1, blocks: 0 },
      'Jusuf Nurkic': { points: 11, rebounds: 11, assists: 4, steals: 1, blocks: 1 },
      'Grayson Allen': { points: 13, rebounds: 4, assists: 3, steals: 1, blocks: 0 },
      'Royce O\'Neale': { points: 8, rebounds: 5, assists: 2, steals: 1, blocks: 0 },
      'Mason Plumlee': { points: 8, rebounds: 7, assists: 2, steals: 1, blocks: 1 },
      'Monte Morris': { points: 8, rebounds: 2, assists: 3, steals: 1, blocks: 0 }
    },
    colors: { primary: 'bg-orange-600', secondary: 'bg-purple-900', tertiary: 'bg-slate-900' }
  },
  'New York Knicks': {
    name: 'New York Knicks',
    shortName: 'NYK',
    roster: ['Jose Alvarado', 'OG Anunoby', 'Mikal Bridges', 'Jalen Brunson', 'Jordan Clarkson', 'Pacome Dadiet', 'Mohamed Diawara', 'Josh Hart', 'Ariel Hukporti', 'Trey Jemison III', 'Dillon Jones', 'Tyler Kolek', 'Miles McBride', 'Kevin McCullar Jr.', 'Mitchell Robinson', 'Landry Shamet', 'Jeremy Sochan', 'Karl-Anthony Towns'],
    numbers: { 'Jose Alvarado': '5', 'OG Anunoby': '8', 'Mikal Bridges': '25', 'Jalen Brunson': '11', 'Jordan Clarkson': '00', 'Pacome Dadiet': '4', 'Mohamed Diawara': '51', 'Josh Hart': '3', 'Ariel Hukporti': '55', 'Trey Jemison III': '50', 'Dillon Jones': '33', 'Tyler Kolek': '13', 'Miles McBride': '2', 'Kevin McCullar Jr.': '9', 'Mitchell Robinson': '23', 'Landry Shamet': '44', 'Jeremy Sochan': '20', 'Karl-Anthony Towns': '32' },
    positions: { 'Jose Alvarado': 'Guard', 'OG Anunoby': 'Forward', 'Mikal Bridges': 'Guard', 'Jalen Brunson': 'Guard', 'Jordan Clarkson': 'Guard', 'Pacome Dadiet': 'Forward', 'Mohamed Diawara': 'Forward', 'Josh Hart': 'Guard', 'Ariel Hukporti': 'Center', 'Trey Jemison III': 'Forward', 'Dillon Jones': 'Forward', 'Tyler Kolek': 'Guard', 'Miles McBride': 'Guard', 'Kevin McCullar Jr.': 'Guard', 'Mitchell Robinson': 'Center', 'Landry Shamet': 'Guard', 'Jeremy Sochan': 'Forward', 'Karl-Anthony Towns': 'Center' },
    goals: {
      'Jose Alvarado': { points: 9, rebounds: 3, assists: 4, steals: 2, blocks: 0 },
      'OG Anunoby': { points: 16, rebounds: 5, assists: 2, steals: 2, blocks: 1 },
      'Mikal Bridges': { points: 18, rebounds: 4, assists: 4, steals: 1, blocks: 1 },
      'Jalen Brunson': { points: 28, rebounds: 4, assists: 7, steals: 1, blocks: 0 },
      'Jordan Clarkson': { points: 15, rebounds: 3, assists: 3, steals: 1, blocks: 0 },
      'Pacome Dadiet': { points: 7, rebounds: 3, assists: 1, steals: 1, blocks: 0 },
      'Mohamed Diawara': { points: 6, rebounds: 4, assists: 1, steals: 1, blocks: 1 },
      'Josh Hart': { points: 12, rebounds: 9, assists: 4, steals: 1, blocks: 0 },
      'Ariel Hukporti': { points: 5, rebounds: 6, assists: 1, steals: 1, blocks: 1 },
      'Trey Jemison III': { points: 6, rebounds: 5, assists: 1, steals: 1, blocks: 1 },
      'Dillon Jones': { points: 8, rebounds: 4, assists: 2, steals: 1, blocks: 0 },
      'Tyler Kolek': { points: 7, rebounds: 2, assists: 4, steals: 1, blocks: 0 },
      'Miles McBride': { points: 10, rebounds: 2, assists: 2, steals: 1, blocks: 0 },
      'Kevin McCullar Jr.': { points: 7, rebounds: 3, assists: 2, steals: 1, blocks: 0 },
      'Mitchell Robinson': { points: 8, rebounds: 9, assists: 1, steals: 1, blocks: 2 },
      'Landry Shamet': { points: 9, rebounds: 2, assists: 1, steals: 1, blocks: 0 },
      'Jeremy Sochan': { points: 11, rebounds: 6, assists: 4, steals: 1, blocks: 1 },
      'Karl-Anthony Towns': { points: 22, rebounds: 10, assists: 3, steals: 1, blocks: 1 }
    },
    colors: { primary: 'bg-orange-500', secondary: 'bg-blue-800', tertiary: 'bg-slate-900' }
  },
  'LA Lakers': {
    name: 'Los Angeles Lakers',
    shortName: 'LAL',
    roster: ['Jake LaRavia', 'Deandre Ayton', 'Rui Hachimura', 'Jaxson Hayes', 'Jarred Vanderbilt', 'Luka Dončić', 'Marcus Smart', 'LeBron James', 'Dalton Knecht', 'Austin Reaves', 'Maxi Kleber', 'Bronny James', 'Luke Kennard', 'Nick Smith Jr.', 'Drew Timme', 'Adou Thiero', 'Chris Mañon'],
    numbers: { 'Jake LaRavia': '12', 'Deandre Ayton': '5', 'Rui Hachimura': '28', 'Jaxson Hayes': '11', 'Jarred Vanderbilt': '2', 'Luka Dončić': '77', 'Marcus Smart': '36', 'LeBron James': '23', 'Dalton Knecht': '4', 'Austin Reaves': '15', 'Maxi Kleber': '14', 'Bronny James': '9', 'Luke Kennard': '10', 'Nick Smith Jr.': '20', 'Drew Timme': '17', 'Adou Thiero': '1', 'Chris Mañon': '30' },
    positions: { 'Jake LaRavia': 'Forward', 'Deandre Ayton': 'Center', 'Rui Hachimura': 'Forward', 'Jaxson Hayes': 'Center', 'Jarred Vanderbilt': 'Forward', 'Luka Dončić': 'Guard', 'Marcus Smart': 'Guard', 'LeBron James': 'Forward', 'Dalton Knecht': 'Forward', 'Austin Reaves': 'Guard', 'Maxi Kleber': 'Forward', 'Bronny James': 'Guard', 'Luke Kennard': 'Guard', 'Nick Smith Jr.': 'Guard', 'Drew Timme': 'Forward', 'Adou Thiero': 'Forward', 'Chris Mañon': 'Guard' },
    goals: {
      'Jake LaRavia': { points: 10, rebounds: 4, assists: 2, steals: 1, blocks: 0 },
      'Deandre Ayton': { points: 17, rebounds: 11, assists: 2, steals: 1, blocks: 1 },
      'Rui Hachimura': { points: 14, rebounds: 5, assists: 1, steals: 1, blocks: 0 },
      'Jaxson Hayes': { points: 8, rebounds: 6, assists: 1, steals: 1, blocks: 1 },
      'Jarred Vanderbilt': { points: 6, rebounds: 7, assists: 1, steals: 1, blocks: 1 },
      'Luka Dončić': { points: 33, rebounds: 9, assists: 10, steals: 1, blocks: 0 },
      'Marcus Smart': { points: 12, rebounds: 3, assists: 5, steals: 2, blocks: 0 },
      'LeBron James': { points: 25, rebounds: 7, assists: 8, steals: 1, blocks: 1 },
      'Dalton Knecht': { points: 12, rebounds: 4, assists: 2, steals: 1, blocks: 0 },
      'Austin Reaves': { points: 17, rebounds: 4, assists: 6, steals: 1, blocks: 0 },
      'Maxi Kleber': { points: 8, rebounds: 5, assists: 1, steals: 1, blocks: 1 },
      'Bronny James': { points: 4, rebounds: 1, assists: 1, steals: 1, blocks: 0 },
      'Luke Kennard': { points: 10, rebounds: 3, assists: 2, steals: 1, blocks: 0 },
      'Nick Smith Jr.': { points: 8, rebounds: 2, assists: 2, steals: 1, blocks: 0 },
      'Drew Timme': { points: 8, rebounds: 5, assists: 2, steals: 1, blocks: 1 },
      'Adou Thiero': { points: 7, rebounds: 4, assists: 1, steals: 1, blocks: 1 },
      'Chris Mañon': { points: 6, rebounds: 3, assists: 1, steals: 1, blocks: 0 }
    },
    colors: { primary: 'bg-purple-800', secondary: 'bg-yellow-400', tertiary: 'bg-slate-900' }
  },
  'Houston Rockets': {
    name: 'Houston Rockets',
    shortName: 'HOU',
    roster: ['Alperen Sengun', 'Jalen Green', 'Fred VanVleet', 'Jabari Smith Jr.', 'Amen Thompson', 'Dillon Brooks', 'Cam Whitmore', 'Tari Eason', 'Reed Sheppard'],
    numbers: { 'Alperen Sengun': '28', 'Jalen Green': '4', 'Fred VanVleet': '5', 'Jabari Smith Jr.': '10', 'Amen Thompson': '1', 'Dillon Brooks': '9', 'Cam Whitmore': '7', 'Tari Eason': '17', 'Reed Sheppard': '15' },
    positions: { 'Alperen Sengun': 'Center', 'Jalen Green': 'Guard', 'Fred VanVleet': 'Guard', 'Jabari Smith Jr.': 'Forward', 'Amen Thompson': 'Guard', 'Dillon Brooks': 'Forward', 'Cam Whitmore': 'Forward', 'Tari Eason': 'Forward', 'Reed Sheppard': 'Guard' },
    goals: {
      'Alperen Sengun': { points: 22, rebounds: 10, assists: 6, steals: 1, blocks: 1 },
      'Jalen Green': { points: 22, rebounds: 5, assists: 4, steals: 1, blocks: 0 },
      'Fred VanVleet': { points: 16, rebounds: 4, assists: 8, steals: 1, blocks: 0 },
      'Jabari Smith Jr.': { points: 15, rebounds: 9, assists: 1, steals: 1, blocks: 1 },
      'Amen Thompson': { points: 12, rebounds: 7, assists: 4, steals: 2, blocks: 1 },
      'Dillon Brooks': { points: 12, rebounds: 3, assists: 2, steals: 1, blocks: 0 },
      'Cam Whitmore': { points: 14, rebounds: 4, assists: 1, steals: 0, blocks: 0 },
      'Tari Eason': { points: 10, rebounds: 8, assists: 1, steals: 2, blocks: 1 },
      'Reed Sheppard': { points: 10, rebounds: 3, assists: 3, steals: 1, blocks: 0 }
    },
    colors: { primary: 'bg-red-600', secondary: 'bg-slate-900', tertiary: 'bg-slate-400' }
  },
  'LA Clippers': {
    name: 'Los Angeles Clippers',
    shortName: 'LAC',
    roster: ['Darius Garland', 'Kawhi Leonard', 'Ivica Zubac', 'Norman Powell', 'Terance Mann', 'Derrick Jones Jr.', 'Kris Dunn', 'Nicolas Batum', 'Kevin Porter Jr.'],
    numbers: { 'Darius Garland': '10', 'Kawhi Leonard': '2', 'Ivica Zubac': '40', 'Norman Powell': '24', 'Terance Mann': '14', 'Derrick Jones Jr.': '55', 'Kris Dunn': '8', 'Nicolas Batum': '33', 'Kevin Porter Jr.': '7' },
    positions: { 'Darius Garland': 'Guard', 'Kawhi Leonard': 'Forward', 'Ivica Zubac': 'Center', 'Norman Powell': 'Guard', 'Terance Mann': 'Guard', 'Derrick Jones Jr.': 'Forward', 'Kris Dunn': 'Guard', 'Nicolas Batum': 'Forward', 'Kevin Porter Jr.': 'Guard' },
    goals: {
      'Darius Garland': { points: 20, rebounds: 3, assists: 7, steals: 1, blocks: 0 },
      'Kawhi Leonard': { points: 24, rebounds: 6, assists: 4, steals: 1, blocks: 1 },
      'Ivica Zubac': { points: 13, rebounds: 11, assists: 1, steals: 0, blocks: 2 },
      'Norman Powell': { points: 18, rebounds: 3, assists: 1, steals: 1, blocks: 0 },
      'Terance Mann': { points: 10, rebounds: 4, assists: 2, steals: 1, blocks: 0 },
      'Derrick Jones Jr.': { points: 10, rebounds: 4, assists: 1, steals: 1, blocks: 1 },
      'Kris Dunn': { points: 7, rebounds: 3, assists: 4, steals: 2, blocks: 0 },
      'Nicolas Batum': { points: 7, rebounds: 4, assists: 2, steals: 1, blocks: 1 },
      'Kevin Porter Jr.': { points: 12, rebounds: 3, assists: 3, steals: 1, blocks: 0 }
    },
    colors: { primary: 'bg-blue-700', secondary: 'bg-red-600', tertiary: 'bg-slate-900' }
  },
  'Cleveland Cavaliers': {
    name: 'Cleveland Cavaliers',
    shortName: 'CLE',
    roster: ['Jarrett Allen', 'Thomas Bryant', 'Keon Ellis', 'Tristan Enaruna', 'James Harden', 'Sam Merrill', 'Riley Minix', 'Donovan Mitchell', 'Evan Mobley', 'Larry Nance Jr.', 'Craig Porter Jr.', 'Tyrese Proctor', 'Olivier Sarr', 'Dennis Schroder', 'Max Strus', 'Nae\'Qwan Tomlin', 'Jaylon Tyson', 'Dean Wade'],
    numbers: { 
      'Jarrett Allen': '31', 
      'Thomas Bryant': '3', 
      'Keon Ellis': '14', 
      'Tristan Enaruna': '21', 
      'James Harden': '1', 
      'Sam Merrill': '5', 
      'Riley Minix': '12', 
      'Donovan Mitchell': '45', 
      'Evan Mobley': '4', 
      'Larry Nance Jr.': '22', 
      'Craig Porter Jr.': '9', 
      'Tyrese Proctor': '24', 
      'Olivier Sarr': '33', 
      'Dennis Schroder': '8', 
      'Max Strus': '2', 
      'Nae\'Qwan Tomlin': '35', 
      'Jaylon Tyson': '20', 
      'Dean Wade': '32' 
    },
    positions: { 
      'Jarrett Allen': 'Center', 
      'Thomas Bryant': 'Center', 
      'Keon Ellis': 'Guard', 
      'Tristan Enaruna': 'Forward', 
      'James Harden': 'Guard', 
      'Sam Merrill': 'Guard', 
      'Riley Minix': 'Forward', 
      'Donovan Mitchell': 'Guard', 
      'Evan Mobley': 'Center', 
      'Larry Nance Jr.': 'Forward', 
      'Craig Porter Jr.': 'Guard', 
      'Tyrese Proctor': 'Guard', 
      'Olivier Sarr': 'Forward', 
      'Dennis Schroder': 'Guard', 
      'Max Strus': 'Guard', 
      'Nae\'Qwan Tomlin': 'Forward', 
      'Jaylon Tyson': 'Guard', 
      'Dean Wade': 'Forward' 
    },
    goals: {
      'Jarrett Allen': { points: 16, rebounds: 11, assists: 2, steals: 1, blocks: 2 },
      'Thomas Bryant': { points: 8, rebounds: 5, assists: 1, steals: 0, blocks: 1 },
      'Keon Ellis': { points: 10, rebounds: 3, assists: 4, steals: 2, blocks: 1 },
      'Tristan Enaruna': { points: 7, rebounds: 4, assists: 1, steals: 1, blocks: 1 },
      'James Harden': { points: 18, rebounds: 6, assists: 10, steals: 1, blocks: 0 },
      'Sam Merrill': { points: 9, rebounds: 2, assists: 2, steals: 0, blocks: 0 },
      'Riley Minix': { points: 6, rebounds: 3, assists: 1, steals: 1, blocks: 1 },
      'Donovan Mitchell': { points: 28, rebounds: 5, assists: 6, steals: 2, blocks: 1 },
      'Evan Mobley': { points: 20, rebounds: 11, assists: 4, steals: 1, blocks: 2 },
      'Larry Nance Jr.': { points: 9, rebounds: 6, assists: 3, steals: 1, blocks: 1 },
      'Craig Porter Jr.': { points: 8, rebounds: 3, assists: 4, steals: 1, blocks: 0 },
      'Tyrese Proctor': { points: 9, rebounds: 3, assists: 5, steals: 1, blocks: 0 },
      'Olivier Sarr': { points: 7, rebounds: 6, assists: 1, steals: 0, blocks: 1 },
      'Dennis Schroder': { points: 14, rebounds: 3, assists: 6, steals: 1, blocks: 0 },
      'Max Strus': { points: 12, rebounds: 4, assists: 3, steals: 1, blocks: 0 },
      'Nae\'Qwan Tomlin': { points: 8, rebounds: 5, assists: 1, steals: 1, blocks: 1 },
      'Jaylon Tyson': { points: 10, rebounds: 4, assists: 3, steals: 1, blocks: 0 },
      'Dean Wade': { points: 8, rebounds: 5, assists: 2, steals: 1, blocks: 1 }
    },
    colors: { primary: 'bg-red-900', secondary: 'bg-yellow-600', tertiary: 'bg-slate-900' }
  },
  'Indiana Pacers': {
    name: 'Indiana Pacers',
    shortName: 'IND',
    roster: ['Tyrese Haliburton', 'Pascal Siakam', 'Myles Turner', 'Aaron Nesmith', 'Andrew Nembhard', 'Bennedict Mathurin', 'T.J. McConnell', 'Obi Toppin'],
    numbers: { 'Tyrese Haliburton': '0', 'Pascal Siakam': '43', 'Myles Turner': '33', 'Aaron Nesmith': '23', 'Andrew Nembhard': '2', 'Bennedict Mathurin': '00', 'T.J. McConnell': '9', 'Obi Toppin': '1' },
    positions: { 'Tyrese Haliburton': 'Guard', 'Pascal Siakam': 'Forward', 'Myles Turner': 'Center', 'Aaron Nesmith': 'Forward', 'Andrew Nembhard': 'Guard', 'Bennedict Mathurin': 'Guard', 'T.J. McConnell': 'Guard', 'Obi Toppin': 'Forward' },
    goals: {
      'Tyrese Haliburton': { points: 22, rebounds: 4, assists: 11, steals: 1, blocks: 0 },
      'Pascal Siakam': { points: 22, rebounds: 8, assists: 4, steals: 1, blocks: 0 },
      'Myles Turner': { points: 17, rebounds: 7, assists: 1, steals: 0, blocks: 2 },
      'Aaron Nesmith': { points: 12, rebounds: 4, assists: 1, steals: 1, blocks: 0 },
      'Andrew Nembhard': { points: 12, rebounds: 3, assists: 5, steals: 1, blocks: 0 },
      'Bennedict Mathurin': { points: 16, rebounds: 4, assists: 2, steals: 1, blocks: 0 },
      'T.J. McConnell': { points: 10, rebounds: 3, assists: 6, steals: 1, blocks: 0 },
      'Obi Toppin': { points: 10, rebounds: 4, assists: 1, steals: 0, blocks: 0 }
    },
    colors: { primary: 'bg-yellow-400', secondary: 'bg-blue-900', tertiary: 'bg-slate-400' }
  },
  'Memphis Grizzlies': {
    name: 'Memphis Grizzlies',
    shortName: 'MEM',
    roster: ['Ja Morant', 'Jaren Jackson Jr.', 'Desmond Bane', 'Marcus Smart', 'Zach Edey', 'Santi Aldama', 'Luke Kennard', 'Gregory Jackson II', 'Vince Williams Jr.'],
    numbers: { 'Ja Morant': '12', 'Jaren Jackson Jr.': '13', 'Desmond Bane': '22', 'Marcus Smart': '36', 'Zach Edey': '14', 'Santi Aldama': '7', 'Luke Kennard': '10', 'Gregory Jackson II': '45', 'Vince Williams Jr.': '5' },
    positions: { 'Ja Morant': 'Guard', 'Jaren Jackson Jr.': 'Forward', 'Desmond Bane': 'Guard', 'Marcus Smart': 'Guard', 'Zach Edey': 'Center', 'Santi Aldama': 'Forward', 'Luke Kennard': 'Guard', 'Gregory Jackson II': 'Forward', 'Vince Williams Jr.': 'Forward' },
    goals: {
      'Ja Morant': { points: 26, rebounds: 6, assists: 8, steals: 1, blocks: 0 },
      'Jaren Jackson Jr.': { points: 22, rebounds: 6, assists: 2, steals: 1, blocks: 3 },
      'Desmond Bane': { points: 23, rebounds: 5, assists: 5, steals: 1, blocks: 0 },
      'Marcus Smart': { points: 12, rebounds: 3, assists: 5, steals: 2, blocks: 0 },
      'Zach Edey': { points: 12, rebounds: 9, assists: 1, steals: 0, blocks: 2 },
      'Santi Aldama': { points: 11, rebounds: 6, assists: 2, steals: 1, blocks: 1 },
      'Luke Kennard': { points: 10, rebounds: 3, assists: 2, steals: 1, blocks: 0 },
      'Gregory Jackson II': { points: 14, rebounds: 4, assists: 1, steals: 1, blocks: 0 },
      'Vince Williams Jr.': { points: 10, rebounds: 5, assists: 3, steals: 1, blocks: 0 }
    },
    colors: { primary: 'bg-blue-300', secondary: 'bg-blue-900', tertiary: 'bg-yellow-400' }
  },
  'Orlando Magic': {
    name: 'Orlando Magic',
    shortName: 'ORL',
    roster: ['Paolo Banchero', 'Franz Wagner', 'Jalen Suggs', 'Kentavious Caldwell-Pope', 'Wendell Carter Jr.', 'Cole Anthony', 'Moritz Wagner', 'Anthony Black', 'Gary Harris'],
    numbers: { 'Paolo Banchero': '5', 'Franz Wagner': '22', 'Jalen Suggs': '4', 'Kentavious Caldwell-Pope': '3', 'Wendell Carter Jr.': '34', 'Cole Anthony': '50', 'Moritz Wagner': '21', 'Anthony Black': '0', 'Gary Harris': '14' },
    positions: { 'Paolo Banchero': 'Forward', 'Franz Wagner': 'Forward', 'Jalen Suggs': 'Guard', 'Kentavious Caldwell-Pope': 'Guard', 'Wendell Carter Jr.': 'Center', 'Cole Anthony': 'Guard', 'Moritz Wagner': 'Center', 'Anthony Black': 'Guard', 'Gary Harris': 'Guard' },
    goals: {
      'Paolo Banchero': { points: 25, rebounds: 8, assists: 6, steals: 1, blocks: 1 },
      'Franz Wagner': { points: 20, rebounds: 6, assists: 4, steals: 1, blocks: 0 },
      'Jalen Suggs': { points: 14, rebounds: 3, assists: 3, steals: 2, blocks: 0 },
      'Kentavious Caldwell-Pope': { points: 10, rebounds: 3, assists: 2, steals: 1, blocks: 0 },
      'Wendell Carter Jr.': { points: 12, rebounds: 9, assists: 2, steals: 1, blocks: 1 },
      'Cole Anthony': { points: 12, rebounds: 4, assists: 3, steals: 1, blocks: 0 },
      'Moritz Wagner': { points: 11, rebounds: 5, assists: 1, steals: 1, blocks: 0 },
      'Anthony Black': { points: 8, rebounds: 3, assists: 2, steals: 1, blocks: 0 },
      'Gary Harris': { points: 7, rebounds: 2, assists: 1, steals: 1, blocks: 0 }
    },
    colors: { primary: 'bg-blue-500', secondary: 'bg-slate-400', tertiary: 'bg-black' }
  },
  'Sacramento Kings': {
    name: 'Sacramento Kings',
    shortName: 'SAC',
    roster: ['De\'Aaron Fox', 'Domantas Sabonis', 'DeMar DeRozan', 'Keegan Murray', 'Malik Monk', 'Kevin Huerter', 'Keon Ellis', 'Trey Lyles'],
    numbers: { 'De\'Aaron Fox': '5', 'Domantas Sabonis': '10', 'DeMar DeRozan': '10', 'Keegan Murray': '13', 'Malik Monk': '0', 'Kevin Huerter': '9', 'Keon Ellis': '23', 'Trey Lyles': '41' },
    positions: { 'De\'Aaron Fox': 'Guard', 'Domantas Sabonis': 'Center', 'DeMar DeRozan': 'Forward', 'Keegan Murray': 'Forward', 'Malik Monk': 'Guard', 'Kevin Huerter': 'Guard', 'Keon Ellis': 'Guard', 'Trey Lyles': 'Forward' },
    goals: {
      'De\'Aaron Fox': { points: 27, rebounds: 4, assists: 6, steals: 2, blocks: 0 },
      'Domantas Sabonis': { points: 20, rebounds: 13, assists: 8, steals: 1, blocks: 1 },
      'DeMar DeRozan': { points: 22, rebounds: 4, assists: 5, steals: 1, blocks: 0 },
      'Keegan Murray': { points: 16, rebounds: 6, assists: 2, steals: 1, blocks: 1 },
      'Malik Monk': { points: 15, rebounds: 3, assists: 5, steals: 1, blocks: 0 },
      'Kevin Huerter': { points: 10, rebounds: 3, assists: 3, steals: 1, blocks: 0 },
      'Keon Ellis': { points: 8, rebounds: 2, assists: 2, steals: 1, blocks: 0 },
      'Trey Lyles': { points: 8, rebounds: 5, assists: 1, steals: 1, blocks: 0 }
    },
    colors: { primary: 'bg-purple-600', secondary: 'bg-slate-400', tertiary: 'bg-black' }
  },
  'New Orleans Pelicans': {
    name: 'New Orleans Pelicans',
    shortName: 'NOP',
    roster: ['Zion Williamson', 'Brandon Ingram', 'Dejounte Murray', 'CJ McCollum', 'Herbert Jones', 'Trey Murphy III', 'Jose Alvarado', 'Daniel Theis'],
    numbers: { 'Zion Williamson': '1', 'Brandon Ingram': '14', 'Dejounte Murray': '5', 'CJ McCollum': '3', 'Herbert Jones': '5', 'Trey Murphy III': '25', 'Jose Alvarado': '15', 'Daniel Theis': '27' },
    positions: { 'Zion Williamson': 'Forward', 'Brandon Ingram': 'Forward', 'Dejounte Murray': 'Guard', 'CJ McCollum': 'Guard', 'Herbert Jones': 'Forward', 'Trey Murphy III': 'Forward', 'Jose Alvarado': 'Guard', 'Daniel Theis': 'Center' },
    goals: {
      'Zion Williamson': { points: 26, rebounds: 7, assists: 5, steals: 1, blocks: 1 },
      'Brandon Ingram': { points: 22, rebounds: 5, assists: 6, steals: 1, blocks: 0 },
      'Dejounte Murray': { points: 18, rebounds: 5, assists: 8, steals: 2, blocks: 0 },
      'CJ McCollum': { points: 18, rebounds: 4, assists: 4, steals: 1, blocks: 0 },
      'Herbert Jones': { points: 11, rebounds: 4, assists: 2, steals: 2, blocks: 1 },
      'Trey Murphy III': { points: 15, rebounds: 5, assists: 2, steals: 1, blocks: 1 },
      'Jose Alvarado': { points: 8, rebounds: 2, assists: 3, steals: 2, blocks: 0 },
      'Daniel Theis': { points: 7, rebounds: 5, assists: 1, steals: 1, blocks: 1 }
    },
    colors: { primary: 'bg-blue-900', secondary: 'bg-red-700', tertiary: 'bg-yellow-500' }
  },
  'Atlanta Hawks': {
    name: 'Atlanta Hawks',
    shortName: 'ATL',
    roster: ['Jalen Johnson', 'Zaccharie Risacher', 'Clint Capela', 'Bogdan Bogdanovic', 'Dyson Daniels', 'De\'Andre Hunter', 'Onyeka Okongwu'],
    numbers: { 'Jalen Johnson': '1', 'Zaccharie Risacher': '10', 'Clint Capela': '15', 'Bogdan Bogdanovic': '13', 'Dyson Daniels': '4', 'De\'Andre Hunter': '12', 'Onyeka Okongwu': '17' },
    positions: { 'Jalen Johnson': 'Forward', 'Zaccharie Risacher': 'Forward', 'Clint Capela': 'Center', 'Bogdan Bogdanovic': 'Guard', 'Dyson Daniels': 'Guard', 'De\'Andre Hunter': 'Forward', 'Onyeka Okongwu': 'Center' },
    goals: {
      'Jalen Johnson': { points: 18, rebounds: 9, assists: 4, steals: 1, blocks: 1 },
      'Zaccharie Risacher': { points: 14, rebounds: 5, assists: 2, steals: 1, blocks: 1 },
      'Clint Capela': { points: 11, rebounds: 10, assists: 1, steals: 0, blocks: 1 },
      'Bogdan Bogdanovic': { points: 16, rebounds: 4, assists: 3, steals: 1, blocks: 0 },
      'Dyson Daniels': { points: 9, rebounds: 4, assists: 4, steals: 2, blocks: 0 },
      'De\'Andre Hunter': { points: 15, rebounds: 4, assists: 2, steals: 1, blocks: 0 },
      'Onyeka Okongwu': { points: 10, rebounds: 7, assists: 1, steals: 1, blocks: 1 }
    },
    colors: { primary: 'bg-red-600', secondary: 'bg-yellow-500', tertiary: 'bg-black' }
  },
  'Chicago Bulls': {
    name: 'Chicago Bulls',
    shortName: 'CHI',
    roster: ['Coby White', 'Josh Giddey', 'Zach LaVine', 'Nikola Vucevic', 'Patrick Williams', 'Matas Buzelis', 'Ayo Dosunmu', 'Jalen Smith'],
    numbers: { 'Coby White': '0', 'Josh Giddey': '3', 'Zach LaVine': '8', 'Nikola Vucevic': '9', 'Patrick Williams': '44', 'Matas Buzelis': '14', 'Ayo Dosunmu': '11', 'Jalen Smith': '25' },
    positions: { 'Coby White': 'Guard', 'Josh Giddey': 'Guard', 'Zach LaVine': 'Guard', 'Nikola Vucevic': 'Center', 'Patrick Williams': 'Forward', 'Matas Buzelis': 'Forward', 'Ayo Dosunmu': 'Guard', 'Jalen Smith': 'Center' },
    goals: {
      'Coby White': { points: 20, rebounds: 4, assists: 5, steals: 1, blocks: 0 },
      'Josh Giddey': { points: 15, rebounds: 7, assists: 8, steals: 1, blocks: 0 },
      'Zach LaVine': { points: 22, rebounds: 5, assists: 4, steals: 1, blocks: 0 },
      'Nikola Vucevic': { points: 18, rebounds: 10, assists: 3, steals: 1, blocks: 1 },
      'Patrick Williams': { points: 12, rebounds: 5, assists: 2, steals: 1, blocks: 1 },
      'Matas Buzelis': { points: 12, rebounds: 6, assists: 2, steals: 1, blocks: 1 },
      'Ayo Dosunmu': { points: 13, rebounds: 3, assists: 3, steals: 1, blocks: 0 },
      'Jalen Smith': { points: 10, rebounds: 6, assists: 1, steals: 0, blocks: 1 }
    },
    colors: { primary: 'bg-red-700', secondary: 'bg-black', tertiary: 'bg-white' }
  },
  'Brooklyn Nets': {
    name: 'Brooklyn Nets',
    shortName: 'BKN',
    roster: ['Cam Thomas', 'Nic Claxton', 'Cameron Johnson', 'Dennis Schroder', 'Ben Simmons', 'Noah Clowney', 'Trendon Watford', 'Day\'Ron Sharpe'],
    numbers: { 'Cam Thomas': '24', 'Nic Claxton': '33', 'Cameron Johnson': '2', 'Dennis Schroder': '17', 'Ben Simmons': '10', 'Noah Clowney': '21', 'Trendon Watford': '9', 'Day\'Ron Sharpe': '20' },
    positions: { 'Cam Thomas': 'Guard', 'Nic Claxton': 'Center', 'Cameron Johnson': 'Forward', 'Dennis Schroder': 'Guard', 'Ben Simmons': 'Forward', 'Noah Clowney': 'Forward', 'Trendon Watford': 'Forward', 'Day\'Ron Sharpe': 'Center' },
    goals: {
      'Cam Thomas': { points: 25, rebounds: 3, assists: 3, steals: 1, blocks: 0 },
      'Nic Claxton': { points: 12, rebounds: 10, assists: 2, steals: 1, blocks: 2 },
      'Cameron Johnson': { points: 15, rebounds: 4, assists: 2, steals: 1, blocks: 0 },
      'Dennis Schroder': { points: 14, rebounds: 3, assists: 6, steals: 1, blocks: 0 },
      'Ben Simmons': { points: 8, rebounds: 8, assists: 8, steals: 2, blocks: 1 },
      'Noah Clowney': { points: 10, rebounds: 6, assists: 1, steals: 1, blocks: 2 },
      'Trendon Watford': { points: 9, rebounds: 4, assists: 2, steals: 1, blocks: 0 },
      'Day\'Ron Sharpe': { points: 8, rebounds: 8, assists: 1, steals: 1, blocks: 1 }
    },
    colors: { primary: 'bg-black', secondary: 'bg-white', tertiary: 'bg-slate-400' }
  },
  'Toronto Raptors': {
    name: 'Toronto Raptors',
    shortName: 'TOR',
    roster: ['Scottie Barnes', 'RJ Barrett', 'Immanuel Quickley', 'Jakob Poeltl', 'Gradey Dick', 'Kelly Olynyk', 'Davion Mitchell', 'Bruce Brown'],
    numbers: { 'Scottie Barnes': '4', 'RJ Barrett': '9', 'Immanuel Quickley': '5', 'Jakob Poeltl': '19', 'Gradey Dick': '1', 'Kelly Olynyk': '41', 'Davion Mitchell': '45', 'Bruce Brown': '11' },
    positions: { 'Scottie Barnes': 'Forward', 'RJ Barrett': 'Forward', 'Immanuel Quickley': 'Guard', 'Jakob Poeltl': 'Center', 'Gradey Dick': 'Guard', 'Kelly Olynyk': 'Center', 'Davion Mitchell': 'Guard', 'Bruce Brown': 'Guard' },
    goals: {
      'Scottie Barnes': { points: 22, rebounds: 8, assists: 7, steals: 1, blocks: 1 },
      'RJ Barrett': { points: 21, rebounds: 6, assists: 4, steals: 1, blocks: 0 },
      'Immanuel Quickley': { points: 19, rebounds: 4, assists: 7, steals: 1, blocks: 0 },
      'Jakob Poeltl': { points: 11, rebounds: 9, assists: 3, steals: 1, blocks: 2 },
      'Gradey Dick': { points: 13, rebounds: 3, assists: 2, steals: 1, blocks: 0 },
      'Kelly Olynyk': { points: 10, rebounds: 5, assists: 4, steals: 1, blocks: 0 },
      'Davion Mitchell': { points: 9, rebounds: 2, assists: 4, steals: 1, blocks: 0 },
      'Bruce Brown': { points: 10, rebounds: 4, assists: 2, steals: 1, blocks: 0 }
    },
    colors: { primary: 'bg-red-700', secondary: 'bg-black', tertiary: 'bg-slate-400' }
  },
  'Utah Jazz': {
    name: 'Utah Jazz',
    shortName: 'UTA',
    roster: ['Lauri Markkanen', 'Keyonte George', 'Collin Sexton', 'Walker Kessler', 'John Collins', 'Taylor Hendricks', 'Cody Williams', 'Jordan Clarkson'],
    numbers: { 'Lauri Markkanen': '23', 'Keyonte George': '3', 'Collin Sexton': '2', 'Walker Kessler': '24', 'John Collins': '20', 'Taylor Hendricks': '0', 'Cody Williams': '5', 'Jordan Clarkson': '00' },
    positions: { 'Lauri Markkanen': 'Forward', 'Keyonte George': 'Guard', 'Collin Sexton': 'Guard', 'Walker Kessler': 'Center', 'John Collins': 'Forward', 'Taylor Hendricks': 'Forward', 'Cody Williams': 'Forward', 'Jordan Clarkson': 'Guard' },
    goals: {
      'Lauri Markkanen': { points: 24, rebounds: 8, assists: 2, steals: 1, blocks: 1 },
      'Keyonte George': { points: 16, rebounds: 3, assists: 6, steals: 1, blocks: 0 },
      'Collin Sexton': { points: 18, rebounds: 3, assists: 5, steals: 1, blocks: 0 },
      'Walker Kessler': { points: 10, rebounds: 9, assists: 1, steals: 0, blocks: 3 },
      'John Collins': { points: 15, rebounds: 8, assists: 1, steals: 1, blocks: 1 },
      'Taylor Hendricks': { points: 11, rebounds: 6, assists: 1, steals: 1, blocks: 1 },
      'Cody Williams': { points: 10, rebounds: 4, assists: 2, steals: 1, blocks: 1 },
      'Jordan Clarkson': { points: 17, rebounds: 3, assists: 3, steals: 1, blocks: 0 }
    },
    colors: { primary: 'bg-yellow-400', secondary: 'bg-black', tertiary: 'bg-slate-900' }
  },
  'Portland Trail Blazers': {
    name: 'Portland Trail Blazers',
    shortName: 'POR',
    roster: ['Scoot Henderson', 'Anfernee Simons', 'Shaedon Sharpe', 'Jerami Grant', 'Deandre Ayton', 'Donovan Clingan', 'Deni Avdija', 'Robert Williams III'],
    numbers: { 'Scoot Henderson': '00', 'Anfernee Simons': '1', 'Shaedon Sharpe': '17', 'Jerami Grant': '9', 'Deandre Ayton': '2', 'Donovan Clingan': '23', 'Deni Avdija': '8', 'Robert Williams III': '35' },
    positions: { 'Scoot Henderson': 'Guard', 'Anfernee Simons': 'Guard', 'Shaedon Sharpe': 'Guard', 'Jerami Grant': 'Forward', 'Deandre Ayton': 'Center', 'Donovan Clingan': 'Center', 'Deni Avdija': 'Forward', 'Robert Williams III': 'Center' },
    goals: {
      'Scoot Henderson': { points: 18, rebounds: 4, assists: 7, steals: 1, blocks: 0 },
      'Anfernee Simons': { points: 22, rebounds: 3, assists: 5, steals: 1, blocks: 0 },
      'Shaedon Sharpe': { points: 16, rebounds: 4, assists: 3, steals: 1, blocks: 1 },
      'Jerami Grant': { points: 20, rebounds: 4, assists: 3, steals: 1, blocks: 1 },
      'Deandre Ayton': { points: 16, rebounds: 11, assists: 2, steals: 1, blocks: 1 },
      'Donovan Clingan': { points: 10, rebounds: 8, assists: 1, steals: 0, blocks: 2 },
      'Deni Avdija': { points: 14, rebounds: 7, assists: 4, steals: 1, blocks: 1 },
      'Robert Williams III': { points: 8, rebounds: 8, assists: 2, steals: 1, blocks: 2 }
    },
    colors: { primary: 'bg-red-600', secondary: 'bg-black', tertiary: 'bg-slate-400' }
  },
  'Charlotte Hornets': {
    name: 'Charlotte Hornets',
    shortName: 'CHA',
    roster: ['LaMelo Ball', 'Brandon Miller', 'Miles Bridges', 'Mark Williams', 'Josh Green', 'Grant Williams', 'Tre Mann', 'Tidjane Salaun'],
    numbers: { 'LaMelo Ball': '1', 'Brandon Miller': '24', 'Miles Bridges': '0', 'Mark Williams': '5', 'Josh Green': '8', 'Grant Williams': '2', 'Tre Mann': '23', 'Tidjane Salaun': '31' },
    positions: { 'LaMelo Ball': 'Guard', 'Brandon Miller': 'Forward', 'Miles Bridges': 'Forward', 'Mark Williams': 'Center', 'Josh Green': 'Guard', 'Grant Williams': 'Forward', 'Tre Mann': 'Guard', 'Tidjane Salaun': 'Forward' },
    goals: {
      'LaMelo Ball': { points: 24, rebounds: 6, assists: 9, steals: 2, blocks: 0 },
      'Brandon Miller': { points: 20, rebounds: 5, assists: 3, steals: 1, blocks: 1 },
      'Miles Bridges': { points: 20, rebounds: 7, assists: 3, steals: 1, blocks: 1 },
      'Mark Williams': { points: 12, rebounds: 10, assists: 1, steals: 1, blocks: 2 },
      'Josh Green': { points: 10, rebounds: 3, assists: 3, steals: 1, blocks: 0 },
      'Grant Williams': { points: 10, rebounds: 5, assists: 2, steals: 1, blocks: 1 },
      'Tre Mann': { points: 12, rebounds: 3, assists: 4, steals: 1, blocks: 0 },
      'Tidjane Salaun': { points: 9, rebounds: 4, assists: 1, steals: 1, blocks: 1 }
    },
    colors: { primary: 'bg-teal-500', secondary: 'bg-purple-800', tertiary: 'bg-white' }
  },
  'Detroit Pistons': {
    name: 'Detroit Pistons',
    shortName: 'DET',
    roster: ['Cade Cunningham', 'Jalen Duren', 'Javonte Green', 'Tobias Harris', 'Ronald Holland II', 'Kevin Huerter', 'Daniss Jenkins', 'Isaac Jones', 'Chaz Lanier', 'Caris LeVert', 'Wendell Moore Jr.', 'Paul Reed', 'Duncan Robinson', 'Marcus Sasser', 'Tolu Smith', 'Isaiah Stewart', 'Ausar Thompson'],
    numbers: { 
      'Cade Cunningham': '2', 
      'Jalen Duren': '0', 
      'Javonte Green': '31', 
      'Tobias Harris': '12', 
      'Ronald Holland II': '5', 
      'Kevin Huerter': '27', 
      'Daniss Jenkins': '24', 
      'Isaac Jones': '3', 
      'Chaz Lanier': '20', 
      'Caris LeVert': '8', 
      'Wendell Moore Jr.': '14', 
      'Paul Reed': '7', 
      'Duncan Robinson': '55', 
      'Marcus Sasser': '25', 
      'Tolu Smith': '35', 
      'Isaiah Stewart': '28', 
      'Ausar Thompson': '9' 
    },
    positions: { 
      'Cade Cunningham': 'Guard', 
      'Jalen Duren': 'Center', 
      'Javonte Green': 'Guard', 
      'Tobias Harris': 'Forward', 
      'Ronald Holland II': 'Forward', 
      'Kevin Huerter': 'Guard', 
      'Daniss Jenkins': 'Guard', 
      'Isaac Jones': 'Center', 
      'Chaz Lanier': 'Guard', 
      'Caris LeVert': 'Guard', 
      'Wendell Moore Jr.': 'Forward', 
      'Paul Reed': 'Forward', 
      'Duncan Robinson': 'Forward', 
      'Marcus Sasser': 'Guard', 
      'Tolu Smith': 'Forward', 
      'Isaiah Stewart': 'Forward', 
      'Ausar Thompson': 'Guard' 
    },
    goals: {
      'Cade Cunningham': { points: 26, rebounds: 6, assists: 9, steals: 1, blocks: 1 },
      'Jalen Duren': { points: 16, rebounds: 13, assists: 3, steals: 1, blocks: 2 },
      'Javonte Green': { points: 8, rebounds: 4, assists: 1, steals: 1, blocks: 0 },
      'Tobias Harris': { points: 15, rebounds: 6, assists: 2, steals: 1, blocks: 1 },
      'Ronald Holland II': { points: 17, rebounds: 6, assists: 3, steals: 2, blocks: 1 },
      'Kevin Huerter': { points: 12, rebounds: 3, assists: 3, steals: 1, blocks: 0 },
      'Daniss Jenkins': { points: 6, rebounds: 2, assists: 3, steals: 1, blocks: 0 },
      'Isaac Jones': { points: 7, rebounds: 5, assists: 1, steals: 0, blocks: 1 },
      'Chaz Lanier': { points: 8, rebounds: 2, assists: 1, steals: 1, blocks: 0 },
      'Caris LeVert': { points: 14, rebounds: 4, assists: 4, steals: 1, blocks: 0 },
      'Wendell Moore Jr.': { points: 6, rebounds: 3, assists: 2, steals: 1, blocks: 0 },
      'Paul Reed': { points: 9, rebounds: 7, assists: 1, steals: 1, blocks: 1 },
      'Duncan Robinson': { points: 13, rebounds: 3, assists: 2, steals: 1, blocks: 0 },
      'Marcus Sasser': { points: 11, rebounds: 2, assists: 4, steals: 1, blocks: 0 },
      'Tolu Smith': { points: 7, rebounds: 6, assists: 1, steals: 0, blocks: 1 },
      'Isaiah Stewart': { points: 10, rebounds: 8, assists: 1, steals: 1, blocks: 1 },
      'Ausar Thompson': { points: 14, rebounds: 9, assists: 5, steals: 2, blocks: 1 }
    },
    colors: { primary: 'bg-blue-600', secondary: 'bg-red-600', tertiary: 'bg-white' }
  },
  'Washington Wizards': {
    name: 'Washington Wizards',
    shortName: 'WAS',
    roster: ['Trae Young', 'Kyle Kuzma', 'Jordan Poole', 'Alex Sarr', 'Bub Carrington', 'Bilal Coulibaly', 'Jonas Valanciunas', 'Corey Kispert', 'Malcolm Brogdon'],
    numbers: { 'Trae Young': '11', 'Kyle Kuzma': '33', 'Jordan Poole': '13', 'Alex Sarr': '12', 'Bub Carrington': '17', 'Bilal Coulibaly': '0', 'Jonas Valanciunas': '17', 'Corey Kispert': '24', 'Malcolm Brogdon': '15' },
    positions: { 'Trae Young': 'Guard', 'Kyle Kuzma': 'Forward', 'Jordan Poole': 'Guard', 'Alex Sarr': 'Center', 'Bub Carrington': 'Guard', 'Bilal Coulibaly': 'Forward', 'Jonas Valanciunas': 'Center', 'Corey Kispert': 'Forward', 'Malcolm Brogdon': 'Guard' },
    goals: {
      'Trae Young': { points: 26, rebounds: 3, assists: 11, steals: 1, blocks: 0 },
      'Kyle Kuzma': { points: 22, rebounds: 7, assists: 4, steals: 1, blocks: 1 },
      'Jordan Poole': { points: 20, rebounds: 3, assists: 5, steals: 1, blocks: 0 },
      'Alex Sarr': { points: 14, rebounds: 8, assists: 2, steals: 1, blocks: 3 },
      'Bub Carrington': { points: 12, rebounds: 4, assists: 5, steals: 1, blocks: 0 },
      'Bilal Coulibaly': { points: 12, rebounds: 5, assists: 2, steals: 2, blocks: 1 },
      'Jonas Valanciunas': { points: 14, rebounds: 10, assists: 2, steals: 1, blocks: 1 },
      'Corey Kispert': { points: 12, rebounds: 3, assists: 2, steals: 1, blocks: 0 },
      'Malcolm Brogdon': { points: 14, rebounds: 4, assists: 5, steals: 1, blocks: 0 }
    },
    colors: { primary: 'bg-blue-800', secondary: 'bg-red-600', tertiary: 'bg-white' }
  }
};
