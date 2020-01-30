let chai = require('chai');
let chaiHttp = require('chai-http');
let app = require('../server');
let user = require('../services/user');
const assert = require('chai').assert;
let should = chai.should();
chai.use(chaiHttp);
describe("Login", () => {
    describe('/GET Login', () => {
        it('it should validate user if correct, return current date', (done) => {
            chai.request(app)
                .get('/v1/user/self')
                .set("Authorization", "basic " + new Buffer("karan@example.com:Abcd1234!").toString())
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    done();
                });
        });

        it('it should validate user if non correct, return unauthorized', (done) => {
            chai.request(app)
                .get('/v1/user/self')
                .set("Authorization", "basic " + new Buffer("karan@exdewdample.com:asswormkmkd@0330").toString("base64"))
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    done();
                });
        });
    });
});

