'use strict';

function TurboCartoError (message, originalErr, context) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;

  if (originalErr) {
    message += '. Reason: ' + originalErr.message;
  }

  if (context) {
    message += '. Context: ' + JSON.stringify(context);
  }

  this.message = message;
}

require('util').inherits(TurboCartoError, Error);

module.exports = TurboCartoError;
