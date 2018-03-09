const chalk = require('chalk');
const figlet = require('figlet');


/**
 * Dar color a un string.
 *
 * @param msg String al que hay que darle color.
 * @param color Color con el que hay que pintar.
 * @return {string} Devuelve el string con el color que se ha indicado.
 */
const colorize = (msg,color) => {
    if (typeof color !== "undefined"){
        msg=chalk[color].bold(msg);
    }
    return msg;
};
/**
 * Escribe un mensaje de log.
 *
 * @param msg El string a escribir
 * @param color del texto
 */
const log = (msg,color) => {
    console.log(colorize(msg,color));
};
/**
 * Escribe un mensaje de log grande.
 *
 * @param msg Texto a escribir.
 * @param color Color del texto.
 */
const biglog = (msg,color) => {
    log (figlet.textSync(msg,{ horizontalLayout: 'full'}),color);
};
/**
 * Escribe el mensaje de error.
 *
 * @param emsg  Texto del mensaje de error.
 */
const errorlog = (emsg) => {
    console.log(`${colorize("Error","red")}: ${colorize(colorize(emsg,"red"),"bgYellowBright")}`);
};

exports = module.exports = {
    colorize,
    log,
    biglog,
    errorlog
};
