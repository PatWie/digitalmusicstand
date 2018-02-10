/**
 * Mocking client-server processing
 */

import axios from 'axios';

// const _sheets = [
//   {"author": "Adele", "file": "sheets/adele_hello.pdf", "title": "Hello"},
//   {"author": "Yiruma", "file": "sheets/yiruma_kiss-the-rain.pdf", "title": "Kiss the Rain"}
// ]

export default {
  getSheets (cb) {
    axios.get('/sheets')
        .then(response => {
             cb(response.data)
        })
        .catch(error => {
          console.log(error);
        })

    // setTimeout(() => cb(_sheets), 100)
  },

}