SELECT p.id, p.title, p.slug, u.email as seller_email
FROM "Product" p
JOIN "User" u ON p."sellerId" = u.id;

SELECT o.id, o."orderNumber", o.status, u.email as buyer_email
FROM "Order" o
JOIN "User" u ON o."buyerId" = u.id;
