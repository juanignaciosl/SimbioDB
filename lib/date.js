  
  /**
   *  Extend Date JS object
   *
   *  - getWeekFrom:  Get week number providing a date.
   *  - getAge:       Get age from date.
   */


  module.exports = {

    getWeekFrom: function(date) {
      var onejan = new Date(date);
      return Math.ceil((((this - onejan) / 86400000) + onejan.getDay())/7);
    },

    getAge: function(date) {
      var _today = new Date();
      var age = _today.getFullYear() - this.getFullYear();
      var m = _today.getMonth() - this.getMonth();
      if (m < 0 || (m === 0 && _today.getDate() < this.getDate())) {
        age--;
      }
      return age;
    }

  }