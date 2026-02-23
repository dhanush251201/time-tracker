#!/bin/bash

echo "🔀 Setting up port forwarding for time.local"
echo ""
echo "This will forward port 80 → 6969 so you can access http://time.local without the port number"
echo ""

# Create a pf anchor configuration
PF_CONF="/etc/pf.anchors/time.local"
PF_RULE="rdr pass on lo0 inet proto tcp from any to any port 80 -> 127.0.0.1 port 6969"

echo "Creating port forwarding rule..."
echo "$PF_RULE" | sudo tee "$PF_CONF" > /dev/null

# Add the anchor to the main pf.conf if not already present
if ! sudo grep -q "time.local" /etc/pf.conf 2>/dev/null; then
    echo "Adding anchor to /etc/pf.conf..."
    echo "rdr-anchor \"time.local\"" | sudo tee -a /etc/pf.conf > /dev/null
    echo "load anchor \"time.local\" from \"$PF_CONF\"" | sudo tee -a /etc/pf.conf > /dev/null
fi

# Enable and reload pf
echo "Enabling packet filter..."
sudo pfctl -e 2>/dev/null || true
sudo pfctl -f /etc/pf.conf

echo ""
echo "✅ Port forwarding configured successfully!"
echo ""
echo "🌐 You can now access:"
echo "  http://time.local (forwarded to port 6969)"
echo ""
echo "📝 Notes:"
echo "  - Port forwarding persists until system reboot"
echo "  - To remove: sudo pfctl -F all -f /etc/pf.conf"
echo "  - To disable pf: sudo pfctl -d"
echo ""
