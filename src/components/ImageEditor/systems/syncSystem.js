export const shouldBroadcastPresence = (now, lastSentAt, interval = 120) => {
    return now - lastSentAt > interval;
};

export const buildPresencePayload = ({ cursor, activePageId, name, color, selectedLayerId }) => {
    const payload = {
        activePageId,
        name,
        color
    };

    if (cursor) payload.cursor = cursor;
    if (selectedLayerId !== undefined) payload.selectedLayerId = selectedLayerId;

    return payload;
};
