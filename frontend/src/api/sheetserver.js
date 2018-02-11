/**
 * Mocking client-server processing
 */

import axios from 'axios';


export default {
  getSheets (cb) {
    axios.get('/sheets')
        .then(response => {
             cb(response.data)
        })
        .catch(error => {
          console.log(error);
        })
  },

}