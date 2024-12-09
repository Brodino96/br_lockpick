/* eslint-disable no-undef */
let minRot = -90,
  maxRot = 90,
  solveDeg = (Math.random() * 180) - 90,
  solvePadding = 4,
  maxDistFromSolve = 45,
  pinRot = 0,
  cylRot = 0,
  keyRepeatRate = 25,
  cylRotSpeed = 3,
  pinDamage = 20,
  pinHealth = 120,
  pinDamageInterval = 800,
  numPins = 1,
  userPushingCyl = false,
  gameOver = false,
  gamePaused = false,
  pin, cyl, driver, cylRotationInterval, pinLastDamaged;

document.addEventListener("DOMContentLoaded", onReady, false)
function onReady() {

  //pop vars
  pin = document.getElementById('pin');
  cyl = document.getElementById('cylinder');
  driver = document.getElementById('driver');

  document.addEventListener("mousemove", function (e) {
    pinRot = Math.atan2((screen.height / 2) - e.clientY, (screen.width / 2) - e.clientX) * 180 / Math.PI - 90
    if (pinRot < -180){
      pinRot = maxRot
    } else if (pinRot > -180 && pinRot < -90){
      pinRot = minRot
    }
    pin.style.transform = "rotateZ(" + pinRot + "deg)"
  });


  document.addEventListener("keydown", function (e) {
    if ((e.which === 87 || e.which === 65 || e.which === 83 || e.which === 68 || e.which === 37 || e.which === 39) && !userPushingCyl && !gameOver && !gamePaused) {
      pushCyl();
    }
  });

  // noinspection JSJQueryEfficiency
  document.addEventListener("keyup", function (e) {
    if ((e.which === 87 || e.which === 65 || e.which === 83 || e.which === 68 || e.which === 37 || e.which === 39) && !gameOver) {
      unpushCyl();
    }
  });

}

//CYL INTERACTIVITY EVENTS
function pushCyl() {
  let distFromSolve, cylRotationAllowance;
  clearInterval(cylRotationInterval);
  userPushingCyl = true;
  //set an interval based on keyrepeat that will rotate the cyl forward, and if cyl is at or past maxCylRotation based on pick distance from solve, display "bounce" anim and do damage to pick. If pick is within sweet spot params, allow pick to rotate to maxRot and trigger solve functionality

  //SO...to calculate max rotation, we need to create a linear scale from solveDeg+padding to maxDistFromSolve - if the user is more than X degrees away from solve zone, they are maximally distant and the cylinder cannot travel at all. Let's start with 45deg. So...we need to create a scale and do a linear conversion. If user is at or beyond max, return 0. If user is within padding zone, return 100. Cyl may travel that percentage of maxRot before hitting the damage zone.

  distFromSolve = Math.abs(pinRot - solveDeg) - solvePadding;
  distFromSolve = Util.clamp(distFromSolve, maxDistFromSolve, 0);

  cylRotationAllowance = Util.convertRanges(distFromSolve, 0, maxDistFromSolve, 1, 0.02); //oldval is distfromsolve, oldmin is....0? oldMax is maxDistFromSolve, newMin is 100 (we are at solve, so cyl may travel 100% of maxRot), newMax is 0 (we are at or beyond max dist from solve, so cyl may not travel at all - UPDATE - must give cyl just a teensy bit of travel so user isn't hammered);
  cylRotationAllowance = cylRotationAllowance * maxRot;

  cylRotationInterval = setInterval(function () {
    cylRot += cylRotSpeed;
    if (cylRot >= maxRot) {
      cylRot = maxRot;
      // do happy solvey stuff
      clearInterval(cylRotationInterval);
      unlock();
    } else if (cylRot >= cylRotationAllowance) {
      cylRot = cylRotationAllowance;
      // do sad pin-hurty stuff
      damagePin();
    }

    cyl.style.transform = "rotateZ(" + cylRot + "deg)"
    driver.style.transform = "rotateZ(" + cylRot + "deg)"
  }, keyRepeatRate);
}

function unpushCyl() {
  userPushingCyl = false;
  //set an interval based on keyrepeat that will rotate the cyl backward, and if cyl is at or past origin, set to origin and stop.
  clearInterval(cylRotationInterval);
  cylRotationInterval = setInterval(function () {
    cylRot -= cylRotSpeed;
    cylRot = Math.max(cylRot, 0);
    cyl.style.transform = "rotateZ(" + cylRot + "deg)"
    driver.style.transform = "rotateZ(" + cylRot + "deg)"
    if (cylRot <= 0) {
      cylRot = 0;
      clearInterval(cylRotationInterval);
    }
  }, keyRepeatRate);
}

//PIN AND SOLVE EVENTS

function damagePin() {
  if (!pinLastDamaged || Date.now() - pinLastDamaged > pinDamageInterval) {
    const tl = new TimelineLite();
    pinHealth -= pinDamage;
    pinLastDamaged = Date.now()

    //pin damage/lock jiggle animation
    tl.to(pin, (pinDamageInterval / 4) / 1000, {
      rotationZ: pinRot - 2
    });
    tl.to(pin, (pinDamageInterval / 4) / 1000, {
      rotationZ: pinRot
    });
    if (pinHealth <= 0) {
      breakPin();
    }
  }
}

function breakPin() {
  let tl, pinTop, pinBott;
  gamePaused = true;
  clearInterval(cylRotationInterval);
  numPins--;

  pinTop = pin.querySelector('.top');
  pinBott = pin.querySelector('.bott');
  tl = new TimelineLite();
  tl.to(pinTop, 0.7, {
    rotationZ: -400,
    x: -200,
    y: -100,
    opacity: 0
  });
  tl.to(pinBott, 0.7, {
    rotationZ: 400,
    x: 200,
    y: 100,
    opacity: 0,
    onComplete: function () {
      if (numPins > 0) {
        gamePaused = false;
        reset();
      } else {
        outOfPins();
      }
    }
  }, 0)
  tl.play();
}

function reset() {
  //solveDeg = ( Math.random() * 180 ) - 90;
  cylRot = 0;
  pinHealth = 100;
  pinRot = 0;
  pin.style.transform = "rotateZ(" + pinRot + "deg)"
  cyl.style.transform = "rotateZ(" + cylRot + "deg)"
  driver.style.transform = "rotateZ(" + cylRot + "deg)"
  TweenLite.to(pin.find('.top'), 0, {
    rotationZ: 0,
    x: 0,
    y: 0,
    opacity: 1
  });
  TweenLite.to(pin.find('.bott'), 0, {
    rotationZ: 0,
    x: 0,
    y: 0,
    opacity: 1
  });
}

window.addEventListener('message', (event) => {
  if (event.data.type === 'open') {
    document.body.style.display = "block"
  }
});

document.addEventListener("keyup", function(e) {
  if (e.key === "Escape") {
    outOfPins();
  }
});

function outOfPins() {
  gameOver = true;
  fetch(`https://br_lockpick/lost`, {
    method: 'POST'
  }).then(document.body.style.display = "none").then(location.reload());

}

function unlock() {
  gameOver = true;
  fetch(`https://br_lockpick/won`, {
    method: 'POST'
  }).then(document.body.style.display = "none").then(location.reload());
}

//UTIL
Util = {};
Util.clamp = function (val, max, min) {
  return Math.min(Math.max(val, min), max);
}
Util.convertRanges = function (OldValue, OldMin, OldMax, NewMin, NewMax) {
  return (((OldValue - OldMin) * (NewMax - NewMin)) / (OldMax - OldMin)) + NewMin
}
