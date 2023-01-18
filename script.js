'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDate = document.querySelector('.form__input--date');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputHeartRate = document.querySelector('.form__input--hr');
const inputElevation = document.querySelector('.form__input--elevation');

class Workout {
  date = new Date(inputDate.valueAsNumber);
  id = Date.now() + ''; // TODO: add UUID4 for more users
  clicks = 0;

  constructor(time, coords, distance, duration, heartrate) {
    this.time = time;
    this.coords = coords; // [lat, lng]
    this.distance = distance; // in km
    this.duration = duration; // in h
    this.heartrate = heartrate; // in bpm
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on 
     ${months[this.date.getMonth()]} ${this.date.getDate()
  }`;
    console.log(this.date)
    
  }

  click() {
    this.clicks++
  }
}

class Running extends Workout {
  type = 'running';
  
  constructor(time, coords, distance, duration, heartrate, pace) {
    super(time, coords, distance, duration, heartrate);
    this.pace = pace;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Cycling extends Workout {
  type = 'cycling';

  constructor(
    time,
    coords,
    distance,
    duration,
    heartrate,
    elevationGain,
    speed
  ) {
    super(time, coords, distance, duration, heartrate);
    this.speed = speed;
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}
class TrailRunning extends Workout {
  type = 'trailrunning';

  constructor(
    time,
    coords,
    distance,
    duration,
    heartrate,
    elevationGain,
    pace
  ) {
    super(time, coords, distance, duration, heartrate);
    this.pace = pace;
    this.elevationGain = elevationGain;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Swimming extends Workout {
  type = 'swimming';

  constructor(time, coords, distance, duration, heartrate, speed) {
    super(time, coords, distance, duration, heartrate);
    this.speed = speed;
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}
class Walking extends Workout {
  type = 'walking';

  constructor(time, coords, distance, duration, heartrate, pace) {
    super(time, coords, distance, duration, heartrate);
    this.pace = pace;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Yoga extends Workout {
  type = 'yoga';

  constructor(time, coords, duration, heartrate) {
    super(time, coords, duration, heartrate);
    this._setDescription();
  }
}



///////////////////////////////////////////////////
// APP ARCHITECTURE

class App {
  #map;
  #mapZoomLevel = 13;
  #mapEvent;
  #workouts = [];

  constructor() {
    this._getPosition();
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleActivityTypeField);
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this))
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Could not get your position');
        }
      );
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;


    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, this.#mapZoomLevel); // 13 - zoom level

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    //Handling clicks on map.
    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDate.focus();
  }

  _hideForm() {
    //EMpty inputs
    inputDate.value =
    inputDistance.value =
    inputDuration.value =
    inputHeartRate.value =
    inputElevation.value =
    '';
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => form.style.display = 'grid', 1000)

  }
  

  _toggleActivityTypeField(e) {
    let activity = e.target.value;
    switch (activity) {
      case 'running':
        inputElevation.closest('.form__row').classList.add('form__row--hidden');
        inputDistance
          .closest('.form__row')
          .classList.remove('form__row--hidden');
        break;
      case 'trailrunning':
        inputElevation
          .closest('.form__row')
          .classList.remove('form__row--hidden');
        inputDistance
          .closest('.form__row')
          .classList.remove('form__row--hidden');
        break;
      case 'cycling':
        inputElevation
          .closest('.form__row')
          .classList.remove('form__row--hidden');
        inputDistance
          .closest('.form__row')
          .classList.remove('form__row--hidden');
        break;
      case 'swimming':
        inputElevation.closest('.form__row').classList.add('form__row--hidden');
        inputDistance
          .closest('.form__row')
          .classList.remove('form__row--hidden');
        break;
      case 'walking':
        inputElevation.closest('.form__row').classList.add('form__row--hidden');
        inputDistance
          .closest('.form__row')
          .classList.remove('form__row--hidden');
        break;
      case 'yoga':
        inputElevation.closest('.form__row').classList.add('form__row--hidden');
        inputDistance.closest('.form__row').classList.add('form__row--hidden');
        break;
    }
  }

  _newWorkout(e) {
    e.preventDefault();

    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));
    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    // Get Data from the form
    const date = new Date(inputDate.valueAsNumber);
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const heartrate = +inputHeartRate.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;
    const formattedDate =
      date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDay();

    // if running
    if (type === 'running') {
 
      if (
        !validInputs(distance, duration, heartrate) ||
        !allPositive(distance, duration, heartrate)
      )
        return alert('Inputs have to be positive numbers!');

      workout = new Running(
        formattedDate,
        [lat, lng],
        distance,
        duration,
        heartrate,
        this.calcPace
      );
    }

    // if trailrunning

    if (type === 'trailrunning') {
      const elevation = +inputElevation.value;

      if (
        !validInputs(distance, duration, heartrate, elevation) ||
        !allPositive(distance, duration, heartrate)
      )
        return alert('Inputs have to be positive numbers!');

      workout = new TrailRunning(
        formattedDate,
        [lat, lng],
        distance,
        duration,
        heartrate,
        elevation,
        this.calcPace
      );
    }
    // if cycling
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
    
      if (
        !validInputs(distance, duration, heartrate, elevation) ||
        !allPositive(distance, duration, heartrate)
      )
        return alert('Inputs have to be positive numbers!');

      workout = new Cycling(
        formattedDate,
        [lat, lng],
        distance,
        duration,
        heartrate,
        elevation,
        this.calcSpeed
      );
    }

    // if swimming
    if (type === 'swimming') {
     
      if (
        !validInputs(distance, duration, heartrate) ||
        !allPositive(distance, duration, heartrate)
      )
        return alert('Inputs have to be positive numbers!');

      workout = new Swimming(
        formattedDate,
        [lat, lng],
        distance,
        duration,
        heartrate,
        this.calcSpeed
      );
    }
    // if walking
    if (type === 'walking') {

      if (
        !validInputs(distance, duration, heartrate) ||
        !allPositive(distance, duration, heartrate)
      )
        return alert('Inputs have to be positive numbers!');

      workout = new Walking(
        formattedDate,
        [lat, lng],
        distance,
        duration,
        heartrate,
        this.calcPace
      );
    }

    // if yoga
    if (type === 'yoga') {
 
      if (
        !validInputs(duration, heartrate) ||
        !allPositive(duration, heartrate)
      )
        return alert('Inputs have to be positive numbers!');

      workout = new Yoga(formattedDate, [lat, lng], duration, heartrate);
    }



    // Add new object ot workout array
    this.#workouts.push(workout);
    console.log(workout);

    //Display marker on the list
    this._renderWorkout(workout);

    //Display marker on the map
    this._renderWorkoutMarker(workout);

    //Clear input fields

    this._hideForm();
  }

  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(`${
        (workout.type === 'running') | 'trailrunning'
          ? '🏃‍♂️'
          : workout.type === 'cycling'
          ? '🚴‍♀️'
          : workout.type === 'swimming'
          ? '🏊‍♀️'
          : workout.type === 'walking'
          ? '🚶‍♂️'
          : workout.type === 'yoga' ? '🧘‍♀️' : ''
      } ${workout.description}`)
      .openPopup();
  }



  _renderWorkout(workout) {
    let html = `
    <li class="workout workout--${workout.type}" data-id=${workout.id}>
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              (workout.type === 'running') | 'trailrunning'
                ? '🏃‍♂️'
                : workout.type === 'cycling'
                ? '🚴‍♀️'
                : workout.type === 'swimming'
                ? '🏊‍♀️'
                : workout.type === 'walking'
                ? '🚶‍♂️'
                : workout.type === 'yoga' ? '🧘‍♀️' : ''
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
    `;

    if (workout.type === 'running')
      html += `
            <div class="workout__details">
              <span class="workout__icon">⚡️</span>
              <span class="workout__value">${workout.pace.toFixed(2)}</span>
              <span class="workout__unit">min/km</span>
            </div>
            <div class="workout__details">
              <span class="workout__icon">🧡</span>
              <span class="workout__value">${workout.heartrate}</span>
              <span class="workout__unit">bpm</span>
            </div>
          </li>
          `;

    if (workout.type === 'cycling')
      html += `
                <div class="workout__details">
                  <span class="workout__icon">⚡️</span>
                  <span class="workout__value">${workout.speed.toFixed(1)}</span>
                  <span class="workout__unit">km/h</span>
                </div>
                <div class="workout__details">
                  <span class="workout__icon">🧡</span>
                  <span class="workout__value">${workout.heartrate}</span>
                  <span class="workout__unit">bpm</span>
                </div>
                <div class="workout__details">
                  <span class="workout__icon">⛰</span>
                  <span class="workout__value">${workout.elevationGain}</span>
                  <span class="workout__unit">m</span>
               </div>
              </li>
              `;

    if (workout.type === 'trailrunning')
    html += `
              <div class="workout__details">
                <span class="workout__icon">⚡️</span>
                <span class="workout__value">${workout.pace.toFixed(2)}</span>
                <span class="workout__unit">min/km</span>
              </div>
              <div class="workout__details">
                <span class="workout__icon">🧡</span>
                <span class="workout__value">${workout.heartrate}</span>
                <span class="workout__unit">bpm</span>
              </div>
              <div class="workout__details">
                <span class="workout__icon">⛰</span>
                <span class="workout__value">${workout.elevationGain}</span>
                <span class="workout__unit">m</span>
             </div>
            </li>
            `;       

    if (workout.type === 'swimming')
    html += `
              <div class="workout__details">
                <span class="workout__icon">⚡️</span>
                <span class="workout__value">${workout.speed.toFixed(1)}</span>
                <span class="workout__unit">km/h</span>
              </div>
              <div class="workout__details">
                <span class="workout__icon">🧡</span>
                <span class="workout__value">${workout.heartrate}</span>
                <span class="workout__unit">bpm</span>
              </div>
            </li>
            `;    

   if (workout.type === 'walking')
   html += `
             <div class="workout__details">
               <span class="workout__icon">⚡️</span>
               <span class="workout__value">${workout.pace.toFixed(2)}</span>
                <span class="workout__unit">min/km</span>
             </div>
             <div class="workout__details">
               <span class="workout__icon">🧡</span>
               <span class="workout__value">${workout.heartrate}</span>
                <span class="workout__unit">bpm</span>
              </div>
            </li>
            `;                    

   if (workout.type === 'yoga')
   html += `
             <div class="workout__details">
               <span class="workout__icon">🧡</span>
               <span class="workout__value">${workout.heartrate}</span>
                <span class="workout__unit">bpm</span>
              </div>
            </li>
            `;   


  form.insertAdjacentHTML('afterend', html);
  }

  _moveToPopup(e) {
    const workoutEl = e.target.closest('.workout');
    if(!workoutEl) return;
    const workout = this.#workouts.find(work => work.id === workoutEl.dataset.id)
    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1
      }
    })


    //using the public interface
    workout.click();
  };
  
}

const app = new App();
