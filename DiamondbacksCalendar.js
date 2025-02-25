// DiamondbacksCalendar.js
// (prototype)
// job:     creates a large-print Arizona Diamondbacks regular schedule, given a valid month
// git:     https://github.com/motetpaper/dbacks-calendar-js
// needs:   https://github.com/motetpaper/data-dbacks-json
// lic:     MIT
//
import schedule from '../data/dbacks.json' with { type: 'json' }

export class DiamondbacksCalendar {

  constructor(str) {

    let dt = new Date(`1 ${str} 2025`);
    let m = dt.getMonth();

    if(isNaN(m)) {
      throw Error('not a valid calendar month');
    }

    if(m < 2 || m > 8) {
      throw Error('not a valid regular season month, must be between March and September, inclusive');
    }

    this.#month = str;
    this.#make();
  }

  #dataurl = null;
  #month = null;

  asDataURL() {
    return this.#dataurl;
  }

  asImageElement() {
    let data = this.#dataurl;
    return `<img src="${data}">`;
  }

  #make() {

    const whichMonth = this.#month;

    // diamondbacks team colors
    const colors = {
      sedonaRed: '#A71930',
    }

    // page dims
    const dpi = 300;
    const pagew = 11;
    const pageh = 8.5;
    const w = pagew * dpi;
    const h = pageh * dpi;

    // canvas and 2D context
//    const canvas = document.querySelector('#cc');
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();

    // add primer to the background
    ctx.fillStyle = 'white'; // otherwise, transparent
    ctx.fillRect(0,0,w,h); // entire page

    // the month defined here
    const monthCode = (new Date(`1 ${whichMonth} 2025`)).getMonth();;
    const daysInMonth = (new Date(2025,(monthCode+1),0)).getDate();
    const lastDate = daysInMonth - 1;

    // dims
    const [ boxw, boxh ] = [ 300, 300 ];
    const [ offsetx, offsety ] = [ boxw * 2 , boxh ]

    // a month is made of weeks
    const month = [];
    let week = this.#newWeek();

    // the month will be folded into weeks
    // then shown in the console as a table
    for(let i = 0; i < daysInMonth; i++) {

      let date = i + 1;
      let dt = new Date(`${i+1} ${whichMonth} 2025`);
      let weekday = dt.getDay();
      let key = dt.toLocaleDateString('fr-CA');

      let todaysgame = schedule.filter((a)=>a.date==key)[0];
      let athome = (todaysgame && todaysgame.homegame);

      // calendar box object
      week[weekday] = {
        date: date,
        key: key,
        game: todaysgame ? todaysgame : null,
        x: offsetx + boxw * (weekday),
        y: offsety + boxh * month.length,
        w: boxw,
        h: boxh,
        bgcolor: athome ? colors.sedonaRed : 'white',
        textcolor: athome ? 'white' : 'black',
        teamcode: todaysgame ? todaysgame.teamcode : null,
        firstpitch: todaysgame ? todaysgame.firstpitch
          .replace(/[A-Z]/g,'').trim() : null,
      }

      // home away grid background
      ctx.fillStyle = week[weekday].bgcolor;
      ctx.fillRect(week[weekday].x, week[weekday].y,
        week[weekday].w, week[weekday].h)

      // calendar grid lines
      ctx.lineWidth = 8;
      ctx.strokeStyle = 'black';
      ctx.strokeRect(week[weekday].x, week[weekday].y,
        week[weekday].w, week[weekday].h)

      // date marker (upper left)
      ctx.font = '100px Noto Sans Mono';
      ctx.fillStyle = week[weekday].textcolor;
      ctx.fillText(date, week[weekday].x+20, week[weekday].y+100)

      // team symbol (bottom half of box)
      if(week[weekday].teamcode) {
        ctx.font = 'bold 150px Noto Sans Mono';
        ctx.fillStyle = week[weekday].textcolor;
        ctx.fillText(week[weekday].teamcode,
            week[weekday].x+20, week[weekday].y+boxh-20)
      }

      // this is the first pitch area (upper right of box)
      // only shown with team symbol
      if(week[weekday].teamcode) {
        ctx.font = 'bold 40px Noto Sans Mono';
        ctx.textAlign = 'right';
        ctx.fillStyle = week[weekday].textcolor;
        ctx.fillText(week[weekday].firstpitch,
          week[weekday].x+boxw-20, week[weekday].y+60)
        ctx.textAlign = 'left'; // reset ctx back to left alignment
      }

      // after saturday, create a new week
      if(weekday === 6 || i === lastDate) {
        month.push(week);
        week = this.#newWeek();
      }
    }

      // headers and marginalia
      // month title
      ctx.font = 'bold 200px Noto Sans Mono';
      ctx.fillStyle = 'black';
      ctx.fillText(`${whichMonth} 2025`, offsetx, h - offsety/2)

      // legend area

      // legend dims
      const legend = {
        x: w-offsetx-boxw,
        y: h-offsety-boxh,
        w: 200,
        h: 80,
      }

      // legend HOME box
      ctx.fillStyle = colors.sedonaRed;
      ctx.fillRect(legend.x,legend.y,legend.w,legend.h);
      ctx.strokeStyle = 'black';
      ctx.strokeRect(legend.x,legend.y,legend.w,legend.h);
      ctx.font = 'bold 40px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText('HOME',legend.x+20,legend.y+60);

      // legend AWAY box
      ctx.fillStyle = 'white';
      ctx.fillRect(legend.x,legend.y+legend.h,legend.w,legend.h);
      ctx.strokeStyle = 'black';
      ctx.strokeRect(legend.x,legend.y+legend.h,legend.w,legend.h);
      ctx.font = 'bold 40px Noto Sans Mono';
      ctx.fillStyle = 'black';
      ctx.fillText('AWAY',legend.x+20,legend.y+60+legend.h);

      // accent line for weekday headers
      ctx.lineWidth = 8;
      ctx.strokeStyle = 'gray'
      ctx.moveTo(offsetx, offsety - 50);
      ctx.lineTo(offsetx+boxw*7, offsety - 50);
      ctx.stroke();

      // weekday headers
      ctx.fillStyle = 'gray';
      let wd = 'SMTWRFS'.split('');
      for(let k = 0; k < 7; k++) {
        ctx.fillText(wd[k],offsetx+boxw*(k),offsety-100);
      }

      // disclaimer
      ctx.fillStyle = 'black';
      const thedisclaimer = '* SUBJECT TO CHANGE';
      ctx.fillText(thedisclaimer,w-boxw*3,h-offsety);

      ctx.fillStyle = 'gray';
      const thebranding = 'MADE BY MOTET PAPER';
      ctx.fillText(thebranding,w-boxw*3,h-offsety/2);

    // check in the console
    // console.log(month);
    // console.table(month);

    this.#dataurl = canvas.toDataURL();
  }

  // returns a 7-element array of nulls
  #newWeek() {
    return (new Array(7)).fill(null);
  }
}
