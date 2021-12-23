const joi = require('joi');

function Theme(theme) {
  const schema = joi.object({
    body: joi.object({
      bgColor: joi.string().default('white'),
      bgImage: joi.string().optional(),
      linkColor: joi.string().default('blue'),
      borderColor: joi.string().default('black'),
      borderThickness: joi.number().default(4)
    }).default(),
    header: joi.object({
      bgColor: joi.string().default('white'),
      bgImage: joi.string().optional(),
      font: joi.object({
        face: joi.string().default('Tahoma'),
        bold: joi.boolean().default(true),
        color: joi.string().default('black')
      }).default()
    }).default(),
    links: joi.object({
      bgColor: joi.string().default('white'),
      bgImage: joi.string().optional(),
      font: joi.object({
        face: joi.string().default('Tahoma'),
        bold: joi.boolean.default(true),
        color: joi.string().default('black')
      }).default()
    }),
    content: joi.object({
      bgColor: joi.string().default('white'),
      bgImage: joi.string().optional(),
      font: joi.object({
        face: joi.string().default('Tahoma'),
        bold: joi.boolean.default(false),
        color: joi.string().default('black')
      }).default()
    }).default()
  }).default();

  const validated = joi.attempt(theme, schema, {stripUnknown: true});

  return validated;
}

module.exports = Theme;