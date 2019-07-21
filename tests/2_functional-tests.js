/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    
    suite('GET /api/stock-prices => stockData object', function() {
      this.timeout(15000);

      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock1: 'goog'})
        .end(function(err, res){
          console.log(res.body.stockData);
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData.stock, 'GOOG');
          assert.property(res.body.stockData, 'price');
          assert.property(res.body.stockData, 'likes');
          done();
        });
      });
      
      test('1 stock with like', function(done) {
        chai.request(server) 
        .get('/api/stock-prices') 
        .query({stock1: 'goog', like: true})
        .end(function(err, res){
          assert.equal(res.status, 200); 
          assert.equal(res.body.stockData.stock, 'GOOG');
          assert.property(res.body.stockData, "price");
          assert.equal(res.body.stockData.likes, 1);
          done();
        })
      });
      
      test("1 stock with like again (ensure likes aren't double counted)", (done) => {
        chai.request(server) 
        .get('/api/stock-prices') 
        .query({stock1: 'goog', like: true})
        .end((err, res) => {
          assert.equal(res.status, 200); 
          assert.equal(res.body.stockData.stock, 'GOOG'); 
          assert.equal(res.body.stockData.likes, 1)
          done();
        })
      });
      
      test('2 stocks', (done) => {
          chai.request(server)
          .get('/api/stock-prices')
          .query({stock: ["goog", "msft"]})
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isArray(res.body.stockData);
            assert.equal(res.body.stockData[0]['stock'], 'GOOG');
            assert.equal(res.body.stockData[1]['stock'], 'MSFT');
            done();
         });
      });
      
      test('2 stocks with like', function(done) {
          chai.request(server)
         .get('/api/stock-prices')
         .query({stock: ['goog', 'msft'], like: true})
         .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body.stockData);
          assert.equal(res.body.stockData[0]['stock'], 'GOOG');
          assert.equal(res.body.stockData[0]['rel_likes'], 1);
          assert.equal(res.body.stockData[1]['stock'], 'MSFT'); 
          assert.equal(res.body.stockData[1]['rel_likes'], -1);
          done();
         });
       });

    });

});
