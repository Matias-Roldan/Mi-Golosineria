const success = (res, data, status = 200) => res.status(status).json(data);

const created = (res, data) => res.status(201).json(data);

const error = (res, message, status = 400) => res.status(status).json({ error: message });

module.exports = { success, created, error };
