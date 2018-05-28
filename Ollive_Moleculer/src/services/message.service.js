"use strict";

const Database = require("../adapters/Database");
const Models = require("../models");
const { MoleculerError } = require("moleculer").Errors;

module.exports = {
	name: "message",

	settings: {
 		state: {

 		}
	},

	actions: {

		//	call "message.create" --message "Message" --id_user "id_user"
		create: {
			params: {
				message: "string",
				id_user: "string",
			},
			handler(ctx) {
				var salut = new Models.Message(ctx.params).create();
				if (salut) {
					return Database()
						.then((db) => {
							var allSalut = db.get("message");
							if(allSalut.find({ "message": salut.message }).value()) {
								throw new MoleculerError("message", 409, "ERR_CRITICAL", { code: 409, message: "message already exists."} )
							}
							return db.get("message")
								.push(salut)
								.write()
								.then(() => {
									return salut;
								})
								.catch(() => {
									throw new MoleculerError("message", 500, "ERR_CRITICAL", { code: 500, message: "Critical error." } )
								});
					});
				} else {
					throw new MoleculerError("message", 417, "ERR_CRITICAL", { code: 417, message: "message is not valid." } )
				}
			}
		},

		//	call "messages.getAll"
		getAll: {
			params: {

			},
			handler(ctx) {
				return Database()
					.then((db) => {
						return db.get("message").value();
					});
			}
		},


		//	call "messages.get" --id_message "Id_message"
		get: {
			params: {
				id_message: "string"
			},
			handler(ctx) {
				return ctx.call("message.verify", { id_message: ctx.params.id_message })
				.then((exists) => {
					if (exists) {
						return Database()
							.then((db) => {
								var salut = db.get("message").find({ id: ctx.params.id_message }).value();;
								return salut;
							})
							.catch(() => {
								throw new MoleculerError("message", 500, "ERR_CRITICAL", { code: 500, message: "Critical error." } )
							});
					} else {
						throw new MoleculerError("message", 404, "ERR_CRITICAL", { code: 404, message: "Product doesn't exist." } )
					}
				})
			}
		},

		//	call "messages.verify" --id_message "ID_message"
		verify: {
			params: {
				id_message: "string"
			},
			handler(ctx) {
				return Database()
					.then((db) => {
						var value = db.get("message")
										.filter({ id: ctx.params.id_message })
										.value();
						return value.length > 0 ? true : false;
					})
			}
		},
	}
}

		