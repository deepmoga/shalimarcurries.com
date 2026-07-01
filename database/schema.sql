CREATE TABLE menu_categories (
  id VARCHAR(80) PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE menu_products (
  id VARCHAR(80) PRIMARY KEY,
  category_id VARCHAR(80) NOT NULL,
  name VARCHAR(180) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image VARCHAR(255),
  size_options JSON,
  spice_options JSON,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES menu_categories(id)
);

CREATE TABLE app_settings (
  setting_key VARCHAR(80) PRIMARY KEY,
  setting_value JSON NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE delivery_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  suburbs JSON NOT NULL,
  time_slots JSON NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  id VARCHAR(80) PRIMARY KEY,
  mode ENUM('delivery', 'pickup') NOT NULL,
  customer_name VARCHAR(180) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  address VARCHAR(255),
  zipcode VARCHAR(20),
  suburb VARCHAR(120),
  delivery_time VARCHAR(40),
  notes TEXT,
  items JSON NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
