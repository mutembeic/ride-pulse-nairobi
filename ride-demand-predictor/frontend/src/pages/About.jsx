import React from 'react';
import '../App.css';

const team = [
  {
    name: "Lucy Mutua",
    role: "Data Scientist • Team Lead",
    twitter: "#",
    linkedin: "#",
    github: "#"
  },
  {
    name: "Kelvin Kipkorir",
    role: "Data Scientist • ML Engineer",
    twitter: "#",
    linkedin: "#",
    github: "#"
  },
  
  {
    name: "Charles Mutembei",
    role: "Software Developer • ML Engineer",
    twitter: "#",
    linkedin: "#",
    github: "#"
  },
  {
    name: "Sharon Aoko",
    role: "Data Analyst • ML Engineer",
    twitter: "#",
    linkedin: "#",
    github: "#"
  },
  {
    name: "Victor Musyoki",
    role: "Data Scientist • ML Engineer",
    twitter: "#",
    linkedin: "#",
    github: "#"
  }
];

export default function About() {
  return (
    <div className="text-white min-h-screen px-6 py-10 bg-gray-900">
      <div className="max-w-5xl mx-auto space-y-12">
        <section>
          <h1 className="text-4xl font-bold text-cyan-400 mb-4" style={{textAlign: "center"}}>About RidePulse Nairobi</h1>
          <p className="text-gray-300 text-lg leading-relaxed">
            <strong>RidePulse Nairobi</strong> is a data-driven platform designed to help boda-boda riders in Nairobi reduce idle time and fuel waste by predicting high-demand pickup hotspots across the city.
            Powered by a machine learning model trained on historical delivery data, the app offers a simple and intuitive heatmap that shows where customer demand is highest at any hour of the day.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-cyan-300 mb-2" style={{textAlign: "center"}}>Dataset</h2>
          <p className="text-gray-300">
            This project uses real-world delivery records from the{" "}
            <a
              href="https://zindi.africa/competitions/sendy-logistics-challenge/data"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 underline"
            >
              Sendy Logistics Challenge
            </a>{" "}
            on Zindi. The dataset includes over 20,000 ride entries from boda-boda deliveries in Nairobi, each with timestamped pickup coordinates.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-cyan-300 mb-4" style={{textAlign: "center"}}>Meet the Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {team.map((member, index) => (
              <div
                key={index}
                className="team-card bg-gray-800 bg-opacity-70 p-4 rounded-xl shadow-md text-center"
              >
                <div className="avatar-placeholder mx-auto mb-2 text-xl">{member.name.charAt(0)}</div>
                <h3 className="text-lg font-bold text-cyan-200">{member.name}</h3>
                <p className="text-sm text-gray-400 mb-2">{member.role}</p>
                <div className="socials flex justify-center gap-4 text-xl">
                  <a href={member.twitter} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">🐦</a>
                  <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">💼</a>
                  <a href={member.github} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">💻</a>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
