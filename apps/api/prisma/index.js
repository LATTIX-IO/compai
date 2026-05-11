'use strict';

const prisma = require('@prisma/client');
const { db } = require('./client');

module.exports = {
  ...prisma,
  db,
};
