const {models} = require('./model');
const Sequelize = require ('sequelize');
const {log, biglog, errorlog, colorize} = require("./out");


/**
 * Muestra la ayuda.
 */
exports.helpCmd = rl => {
    log("Comandos:");
    log(" h|help - Muestra esta ayuda.");
    log(" list - Listar los quizzes existentes.");
    log(" show <id> - Muestra la pregunta y la respuesta el quiz indicado.");
    log(" add - Añadir un nuevo quiz interactivamente.");
    log(" delete <id> - Borrar el quiz indicado.");
    log(" edit <id> - Editar el quiz indicado.");
    log(" test <id> - Probar el quiz indicado.");
    log(" p|play - Jugar a preguntar aleatoriamente todos los quizzes.");
    log(" credits - Créditos.");
    log(" q|quit - Salir del programa.");
    rl.prompt();
};


/**
 * Lista todos los quizzes existentes en el modelo.
 */
exports.listCmd = rl => {
    //log('Listar todos los quizzes existentes.', 'red');
    models.quiz.findAll()
        .each(quiz => {
        log(`[${colorize(quiz.id, 'magenta')}]: ${quiz.question}`);
})
.catch(error => {
        errorlog(error,message);
})
.then(() => {
        rl.prompt();
});
}
/**
 *Esta funcion devuelve una promesa que:
 * -Valida que se ha introducido un vcalor para el parametro.
 * -Convierte el parametro en un numero entero.
 * Si todo va bien, la promesa se satisface y devuelve el valor de id a usar.
 *
 * @param id Parametro con el índice a validar.
 */
const validateId = id => {
    return new Promise ((resolve, reject) => {
        if (typeof id === "undefined") {
        reject(new Error(`Falta el parametro <id>. `));
    } else {
        id = parseInt(id); //coger la parte entera y descartar lo demás
        if (Number.isNaN(id)) {
            reject(new Error(`El valor del parametro <id> no es un numero. `));
        }else{
            resolve(id);
        }
    }
});
};


/**
 * Muestra el quiz indicado en el parámetro: la pregunta y la respuesta.
 *
 * @param id Clave del quiz a mostrar.
 */
exports.showCmd = (rl, id) => {
    //log('Mostrar el quiz indicado.', 'red');
    if (typeof id === "undefined") {
        errorlog(`Falta el parámetro id.`);
    } else{
        try{
            const quiz = model.getByIndex(id);
            log(` [${colorize(id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
        } catch(error) {
            errorlog(error.message);
        }
    }
    rl.prompt();
};


/**
 * Añade un nuevo quiz al módelo.
 * Pregunta interactivamente por la pregunta y por la respuesta.
 *
 * Hay que recordar que el funcionamiento de la funcion rl.question es asíncrono.
 * El prompt hay que sacarlo cuando ya se ha terminado la interacción con el usuario,
 * la llamada a rl.prompt() se debe hacer en la callback de la segunda llamada a rl.question
 *
 * @param rl Objeto readline usado para implentar el CLI.
 */
exports.addCmd = rl => {

    makeQuestion(rl, ' Introduzca una pregunta: ')
        .then(q => {
            return makeQuestion(rl, ' Introduzca la respuesta: ')
                .then(a => {
                    return {question: q, answer: a};
                });
        })
        .then(quiz => {
            return models.quiz.create(quiz);
        })
        .then((quiz) => {
            log(` ${colorize('Se ha añadido','magenta')}: ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);
        })
        .catch(Sequelize.ValidationError,error => {
            errorlog('El quiz es erróneo:');
            error.errors.forEach(({message}) => errorlog(message));
        })
        .catch(error =>{
            errorlog(error.message);
        })
        .then(() => {
            rl.prompt();
        });
};

/**
 * Borra un quiz del modelo.
 *
 * @param id Clave del quiz a borrar en el modelo.
 */
exports.deleteCmd = (rl,id) => {

    validateId(id)
        .then (id => models.quiz.destroy({where: {id}}))
        .catch(error => {
            errorlog(error.message);
        })
        .then(() => {
            rl.prompt();
        });
};

/**
 * Edita un quiz del modelo.
 *@param rl objeto rl usado para implementar el CLI.
 * @param id Clave del quiz a editar en el modelo.
 */
exports.editCmd = (rl,id) => {

    validateId(id)
        .then(id => models.quiz.findById(id))
        .then(quiz => {
            if (!quiz){
                throw new Error(`No existe un quiz asociado al id=${id}.`);
            }
            process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);
            return makeQuestion(rl, ' Introduzca la pregunta: ')
                .then (q => {
                    process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);
                    return makeQuestion(rl, ' Introduzca la respuesta: ')
                        .then(a =>{
                            quiz.question=q;
                            quiz.answer=a;
                            return quiz;
                        });
                });
        })
        .then(quiz =>{
            return quiz.save();
        })
        .then(quiz =>{
            log(` Se ha cambiado el quiz ${colorize(quiz.id,'magenta')} por: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
        })
        .catch(Sequelize.ValidationError, error =>{
            errorlog('El quiz es erróneo:');
            error.errors.forEach(({message}) => errorlog(message));
        })
        .catch(error =>{
            errorlog(error.message);
        })
        .then(() => {
            rl.prompt();
        });
};

/**
 * Prueba un quiz, es decir, hace una pregunta del modelo a la que debemos contestar.
 *
 * @param id Clave del quiz a probar.
 */
exports.testCmd = (rl, id) => {
//log('Probar el quiz indicado.', 'red')

     validateId(id)
            .then(id => models.quiz.findById(id))
            .then(quiz => {
                if (!quiz){
                    throw new Error(`No existe un quiz asociado al id=${id}.`);
                }
                process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);
                return makeQuestion(rl, ' Introduzca la pregunta: ')
                    .then (q => {
                        process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);
                        return makeQuestion(rl, ' Introduzca la respuesta: ')
                            .then(a =>{
                                quiz.question=q;
                                quiz.answer=a;
                                return quiz;
                            });
                    });
            })
            .then(quiz =>{
                return quiz.save();
            })
            .then(quiz =>{
                log(` Se ha cambiado el quiz ${colorize(quiz.id,'magenta')} por: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
            })
            .catch(Sequelize.ValidationError, error =>{
                errorlog('El quiz es erróneo:');
                error.errors.forEach(({message}) => errorlog(message));
            })
            .catch(error =>{
                errorlog(error.message);
            })
            .then(() => {
                rl.prompt();
            });
    };
/**
 * Pregunta todos los quizzes existentes en el modelo en orden aleatorio.
 * Se gana si se contesta a todos satisfactoriamente.
 */
exports.playCmd = rl => {
//log('Jugar.', 'red');
        let puntos = 0;
        let preguntas = [];
        let respuestas = [];
        var i=0;
        models.quiz.findAll()
            .each(quiz => {
                preguntas[i] = quiz.question;
                respuestas[i]=quiz.answer;
                i++
            })
            .then(() => {
                log(preguntas);
                const juega = () => {
                    let id = Math.floor(Math.random() * (preguntas.length));
                    if (preguntas.length == 0) {
                        log(`No hay nada más que preguntar.`);
                        log(`Fin del juego. Aciertos: ` + puntos);
                        biglog(puntos, 'magenta');
                        rl.prompt();
                    } else {
                        return makeQuestion(rl, colorize(preguntas[id] + '? ', 'red'))
                            .then(respuesta => {
                                if (respuesta.toLowerCase().trim() === respuestas[id].toLowerCase()) {
                                    puntos++;
                                    log(`CORRECTO - LLeva ` + puntos + ` aciertos.`);
                                    preguntas.splice(id, 1);
                                    respuestas.splice(id, 1);
                                    juega();

                                } else {
                                    log(`INCORRECTO.`);
                                    log(`Fin del juego. Aciertos: ` + puntos);
                                    biglog(puntos, 'magenta');
                                    rl.prompt();
                                }
                                ;


                            });
                    }
                    ;
                };

                juega();
            });

    };

exports.creditsCmd = rl =>{
    //log('Autores de la práctica:');
    log('LUCIA y OLGA');
    rl.prompt();
};

    /**
 * Terminar el programa.
 */
exports.quitCmd = rl => {
    rl.close();
}




