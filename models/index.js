import Property from "./property.js";
import Price from "./price.js";
import Category from "./category.js";
import User from "./user.js";
import Message from "./message.js";

// Price.hasOne(Property);

Property.belongsTo(Price, { foreignKey: "priceId" });
Property.belongsTo(Category, { foreignKey: "categoryId" });
Property.belongsTo(User, { foreignKey: "userId" });
Property.hasMany(Message, { foreignKey: "propertyId" });

Message.belongsTo(Property, { foreignKey: "propertyId" });
Message.belongsTo(User, { foreignKey: "userId" });

export { Property, Price, Category, User, Message };
