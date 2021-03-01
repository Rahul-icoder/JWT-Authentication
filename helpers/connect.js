const mongoose = require("mongoose");

const auth = "Auth";

mongoose
	.connect("mongodb://localhost:27017", {
		dbName: auth,
		useUnifiedTopology: true,
		useNewUrlParser: true,
		useFindAndModify: false,
		useCreateIndex: true,
	})
	.then(() => {
		console.log("MongoDB connected");
	});

