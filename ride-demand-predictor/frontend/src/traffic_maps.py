import folium
from folium.plugins import HeatMap
import numpy as np
import pandas as pd
from branca.element import Template, MacroElement


def generate_traffic_data(num_points=150):
    np.random.seed(42)

    lat = np.random.uniform(-1.45, -1.15, num_points)
    lon = np.random.uniform(36.65, 37.00, num_points)
    weight = np.random.randint(1, 10, num_points)
    return pd.DataFrame({'lat': lat, 'lon': lon, 'weight': weight})

traffic_data = generate_traffic_data()


legend_html = '''
{% macro html(this, kwargs) %}
<div style="
    position: fixed; 
    bottom: 50px;
    left: 50px;
    width: 180px;
    z-index:9999;
    font-size:12px;
    background-color:white;
    padding:10px;
    border-radius:5px;
    box-shadow: 0 0 10px rgba(0,0,0,0.2);
    ">
    <p style="margin-top:0; font-weight:bold; text-align:center;">Traffic Key</p>
    <div style="background: linear-gradient(to right, #0000ff, #00ffff, #ffff00, #ff0000); 
                height: 20px;
                margin-bottom: 10px;
                border-radius:3px;"></div>
    <div style="display: flex; justify-content: space-between; margin-bottom:5px;">
        <span>Flowing</span>
        <span>Gridlock</span>
    </div>
    <div style="border-top:1px solid #ddd; margin:8px 0; padding-top:8px;">
        <div style="display:flex; align-items:center; margin-bottom:4px;">
            <div style="background:#2ecc71; width:12px; height:12px; border-radius:50%; margin-right:6px;"></div>
            <span>Major Landmark</span>
        </div>
        <div style="display:flex; align-items:center; margin-bottom:4px;">
            <div style="background:#e74c3c; width:12px; height:12px; border-radius:50%; margin-right:6px;"></div>
            <span>Accident Prone</span>
        </div>
        <div style="display:flex; align-items:center;">
            <div style="background:#3498db; width:12px; height:12px; border-radius:50%; margin-right:6px;"></div>
            <span>Traffic Police</span>
        </div>
    </div>
</div>
{% endmacro %}
'''

def create_kenya_traffic_map(data, output_file="traffic_map.html"):
   
    m = folium.Map(location=[-1.286389, 36.817223], zoom_start=11, 
                  tiles='cartodbpositron', control_scale=True)


    HeatMap(data[['lat', 'lon', 'weight']].values, 
            radius=15, 
            blur=8,
            gradient={0.1: 'blue', 0.3: 'cyan', 0.5: 'lime', 0.7: 'yellow', 1: 'red'},
            zoom=10
           ).add_to(m)


    landmarks = [
        {"name": "Nairobi CBD", "coords": [-1.286389, 36.817223], "desc": "Central Business District"},
        {"name": "JKIA Airport", "coords": [-1.3192, 36.9278], "desc": "Jomo Kenyatta International Airport"},
        {"name": "KICC", "coords": [-1.2886, 36.8233], "desc": "Kenyatta International Convention Centre"}
    ]
    
 
    accident_zones = [
        {"name": "Thika Road", "coords": [-1.2136, 36.8997], "desc": "High accident rate area"},
        {"name": "Mombasa Road", "coords": [-1.3195, 36.8348], "desc": "Frequent truck accidents"}
    ]
    
  
    police_points = [
        {"name": "Ruiru Checkpoint", "coords": [-1.1475, 36.9638], "desc": "24/7 traffic police presence"},
        {"name": "Langata Road", "coords": [-1.3286, 36.8125], "desc": "Morning traffic control"}
    ]


    for loc in landmarks:
        folium.Marker(
            location=loc["coords"],
            popup=f"<b>{loc['name']}</b><br>{loc['desc']}",
            icon=folium.Icon(color="green", icon="info-sign")
        ).add_to(m)
    
    for loc in accident_zones:
        folium.Marker(
            location=loc["coords"],
            popup=f"<b>⚠ {loc['name']}</b><br>{loc['desc']}",
            icon=folium.Icon(color="red", icon="exclamation-sign")
        ).add_to(m)
    
    for loc in police_points:
        folium.Marker(
            location=loc["coords"],
            popup=f"<b>🚓 {loc['name']}</b><br>{loc['desc']}",
            icon=folium.Icon(color="blue", icon="flag")
        ).add_to(m)

 
    macro = MacroElement()
    macro._template = Template(legend_html)
    m.get_root().add_child(macro)

   
    title_html = '''
    <h3 style="position:fixed; top:10px; left:50px; z-index:9999; 
    background-color:white; padding:10px; border-radius:5px;
    box-shadow:0 0 5px rgba(0,0,0,0.2); font-size:16px;">
    Nairobi Traffic Heatmap</h3>
    '''
    m.get_root().html.add_child(folium.Element(title_html))

    m.save(output_file)
    print(f"Interactive Kenya traffic map saved to {output_file}")

create_kenya_traffic_map(traffic_data)