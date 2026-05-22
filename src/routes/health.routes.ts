<hostname>tseesa301.tse.local</hostname>

  <ports>
    <port_interface>
      <port_name>Management</port_name>
      <direct>
        <jack>Management</jack>
        <jack_mtu>1500</jack_mtu>
      </direct>
    </port_interface>
    <port_interface>
      <port_name>Data 2</port_name>
      <direct>
        <jack>Data 2</jack>
        <jack_mtu>1500</jack_mtu>
      </direct>
    </port_interface>
    <port_interface>
      <port_name>Data 1</port_name>
      <direct>
        <jack>Data 1</jack>
        <jack_mtu>1500</jack_mtu>
      </direct>
    </port_interface>
  </ports>
  <interfaces>
    <interface>
      <interface_name>Management</interface_name>
      <ip>10.62.3.102</ip>
      <phys_interface>Management</phys_interface>
      <netmask>24</netmask>
      <interface_hostname>tseesa301.tse.local</interface_hostname>
      <ftpd_port>21</ftpd_port>
      <sshd_port>22</sshd_port>
      <ccs_port>2222</ccs_port>
      <httpd_port>80</httpd_port>
      <https_redirect>1</https_redirect>
      <httpsd_port>443</httpsd_port>
      <api_httpd_port>6080</api_httpd_port>
      <api_httpsd_port>6443</api_httpsd_port>
      <certificate_name>TSEESA 2025</certificate_name>
    </interface>
    <interface>
      <interface_name>external_smtp</interface_name>
      <ip>10.62.2.66</ip>
      <phys_interface>Data 2</phys_interface>
      <netmask>24</netmask>
      <interface_hostname>tsemx.telenor.se</interface_hostname>
      <httpsd_port>443</httpsd_port>
      <certificate_name>tseesa</certificate_name>
    </interface>
    <interface>
      <interface_name>internal_smtp</interface_name>
      <ip>10.62.0.88</ip>
      <phys_interface>Data 1</phys_interface>
      <netmask>23</netmask>
      <interface_hostname>smtp-int.tse.local</interface_hostname>
      <httpsd_port>443</httpsd_port>
      <certificate_name>tseesa</certificate_name>
    </interface>
  </interfaces>
