const parser = require('parse-full-name');

const MIN_TERMS = 2;
const MIN_TERM_LEN = 2;

class NameParserService {

    parseName(text) {
        const result = {is_valid: null, value:{}};
        const name = parser.parseFullName(text,false,false,false,true);
        result.is_valid = this._isValid(text,name);
        if(result.is_valid) {
            result.value.first_name = name.first;
            result.value.last_name = name.last;
        }
        return result;
    } 

    _isValid(text,parsedName) {
        const splitText = text.split(' ');
        if(splitText.length < MIN_TERMS) {
            return false;
        }
        if(splitText.some(term => term.length < MIN_TERM_LEN)) {
            return false;
        }
        if(parsedName.error.length !== 0) {
            return false;
        }
        if(parsedName.middle.split(' ').length >= MIN_TERM_LEN) {
            return false;
        }
        return true;
    }

}

module.exports = new NameParserService();