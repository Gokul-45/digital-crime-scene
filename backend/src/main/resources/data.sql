-- ============================================================
-- SAMPLE DATA
-- All demo accounts use password: password123
-- ============================================================

INSERT INTO users (username, email, password_hash, role, full_name, badge_number, department, is_active)
VALUES
('admin','admin@crimescene.gov','$2a$10$e6oB.0Nn/M1lENpTBQfTwuI6o5s6jlRMCBorfCYLvx1oPIu3AY/Aq','ADMIN','Administrator','ADM-001','System Administration',true),
('det_sharma','sharma@crimescene.gov','$2a$10$e6oB.0Nn/M1lENpTBQfTwuI6o5s6jlRMCBorfCYLvx1oPIu3AY/Aq','INVESTIGATOR','Det. Rajesh Sharma','INV-012','Homicide Division',true),
('det_priya','priya@crimescene.gov','$2a$10$e6oB.0Nn/M1lENpTBQfTwuI6o5s6jlRMCBorfCYLvx1oPIu3AY/Aq','INVESTIGATOR','Det. Priya Nair','INV-017','Cyber Crimes Division',true),
('analyst_ak','akamath@crimescene.gov','$2a$10$e6oB.0Nn/M1lENpTBQfTwuI6o5s6jlRMCBorfCYLvx1oPIu3AY/Aq','ANALYST','Arjun Kamath','ANL-005','Forensic Analytics',true);

INSERT INTO cases (case_number,title,description,location,latitude,longitude,crime_type,status,priority,incident_date,created_by,lead_investigator)
VALUES
('CASE-2024-001','MG Road Robbery','Armed robbery at MG Road jewelry shop. Two suspects fled on motorcycle.','MG Road, Bangalore',12.9754,77.6074,'ROBBERY','ACTIVE','HIGH','2024-01-15T22:30:00',1,2),
('CASE-2024-002','HSR Layout Assault','Physical assault near sector 3. Victim hospitalized.','HSR Layout, Bangalore',12.9116,77.6474,'ASSAULT','OPEN','MEDIUM','2024-01-20T20:00:00',1,3),
('CASE-2024-003','Koramangala Burglary','Residential burglary. Electronics and jewelry stolen.','Koramangala 5th Block',12.9352,77.6245,'BURGLARY','SOLVED','LOW','2024-01-10T02:15:00',1,2),
('CASE-2024-004','Whitefield Hit-and-Run','Vehicle fled after collision near ITPL. Driver unidentified.','Whitefield, Bangalore',12.9698,77.7500,'HIT_AND_RUN','ACTIVE','CRITICAL','2024-01-25T07:45:00',2,2),
('CASE-2024-005','Electronic City Fraud','Corporate fraud scheme involving wire transfers.','Electronic City Phase 1',12.8399,77.6770,'FRAUD','OPEN','HIGH','2024-01-28T09:00:00',3,3);

INSERT INTO evidence (case_id,evidence_number,title,description,type,file_name,location,latitude,longitude,collected_at,forensic_notes,tags,is_key_evidence,uploaded_by)
VALUES
(1,'EVD-001','CCTV Footage - Shop Cam 1','CCTV footage showing two suspects entering.','VIDEO','cctv_mg_road_01.mp4','MG Road Shop',12.9754,77.6074,'2024-01-15T23:00:00','Two individuals in dark clothing with helmets.','cctv,helmet,suspects',true,2),
(1,'EVD-002','Fingerprint Sample - Counter','Partial fingerprint lifted from glass counter.','PHYSICAL','fingerprint_01.jpg','MG Road Shop',12.9754,77.6074,'2024-01-16T02:00:00','Loop pattern. 12 ridge points.','fingerprint,physical,trace',true,2),
(1,'EVD-003','Witness Photo - Bystander','Mobile photo of fleeing motorcycle.','IMAGE','witness_photo_01.jpg','MG Road Exit',12.9751,77.6080,'2024-01-16T01:30:00','Motorcycle plate partially visible: KA05-XX.','motorcycle,photo',false,2),
(2,'EVD-004','Medical Examination Report','Victim examination confirming blunt force trauma.','DOCUMENT','medical_report.pdf','HSR Layout',12.9116,77.6474,'2024-01-20T22:00:00','Injuries consistent with multiple attackers.','medical,trauma',true,3);

INSERT INTO witnesses (case_id,name,age,contact,witness_type,statement,statement_date,credibility_score,nlp_analyzed,recorded_by)
VALUES
(1,'Ramesh Patel',45,'9876543210','EYE_WITNESS','I saw two men rush into the shop wearing dark jackets and helmets. They ran out and jumped on a motorcycle.','2024-01-16T08:00:00',82.0,true,2),
(1,'Sunita Rao',32,'9123456780','BYSTANDER','There was commotion near the jewelry shop. I saw two people escape but could not identify them.','2024-01-16T09:30:00',55.0,true,2),
(2,'Kavya Nair',28,'8098765432','EYE_WITNESS','Three men approached the victim. One wore a red hoodie. They ran toward the park exit.','2024-01-21T10:00:00',90.0,true,3);

INSERT INTO suspects (case_id,name,alias,age,description,last_known_location,last_seen_latitude,last_seen_longitude,status,probability_score,evidence_match_score,proximity_score,timeline_score,behavior_score,criminal_record,added_by)
VALUES
(1,'Vikram Desai','Vicky',29,'Male, 5ft 10in, athletic build. Known motorcycle operator.','Ejipura Slums',12.9498,77.6201,'SUSPECT',78.5,82.0,75.0,80.0,65.0,'Prior petty theft record.',2),
(1,'Raju Kumar','Raja',24,'Male, 5ft 8in. Mechanic shop worker and known associate of Vikram.','Shivaji Nagar',12.9825,77.6003,'PERSON_OF_INTEREST',52.0,45.0,60.0,55.0,48.0,'No prior criminal record.',2),
(2,'Arun Mehta',null,35,'Male, stocky build. Frequently wears a red hoodie.','HSR Layout Sector 4',12.9120,77.6480,'SUSPECT',65.0,70.0,80.0,60.0,55.0,'Assault case in 2022; charges dropped.',3);

INSERT INTO locations (case_id,name,type,latitude,longitude,description)
VALUES
(1,'MG Road Jewelry Shop','CRIME_SCENE',12.9754,77.6074,'Primary crime scene'),
(1,'MG Road Signal','INTERSECTION',12.9751,77.6080,'Main intersection'),
(1,'Richmond Circle','CHECKPOINT',12.9716,77.6065,'Key junction'),
(1,'Lalbagh West Gate','CHECKPOINT',12.9499,77.5837,'Direction south'),
(1,'Electronics City Highway','ESCAPE_ROUTE',12.8439,77.6630,'Suspected escape destination');

INSERT INTO timeline_events (case_id,event_time,phase,title,description,event_type,latitude,longitude,confidence_level,source,is_verified,related_evidence_id,created_by)
VALUES
(1,'2024-01-15T20:00:00','BEFORE','Suspects Surveilling Shop','CCTV shows two individuals making multiple passes near the jewelry shop.','CCTV',12.9751,77.6082,85.0,'CCTV Camera 1',true,1,2),
(1,'2024-01-15T22:30:00','DURING','Robbery Commenced','Two suspects entered the jewelry shop and seized valuables.','INCIDENT',12.9754,77.6074,95.0,'Shop CCTV',true,1,2),
(1,'2024-01-15T22:38:00','DURING','Suspects Fled on Motorcycle','Both suspects fled toward MG Road signal.','MOVEMENT',12.9751,77.6080,90.0,'Witness Account',true,3,2),
(1,'2024-01-16T02:00:00','AFTER','Fingerprint Sample Collected','Forensics collected a fingerprint from the glass counter.','EVIDENCE_FOUND',12.9754,77.6074,95.0,'Forensic Team',true,2,2);

INSERT INTO ai_insights (case_id,insight_type,title,content,severity,related_entity_type,related_entity_id,confidence,is_dismissed)
VALUES
(1,'SUSPECT_RANKING','Primary Suspect: Vikram Desai','Evidence correlation places Vikram Desai at the top of the current suspect list.','CRITICAL','SUSPECT',1,78.5,false),
(1,'CONTRADICTION','Witness Statement Inconsistency','Witness statements contain details that should be cross-checked during investigation.','WARNING','WITNESS',2,75.0,false),
(1,'SUSPICIOUS_MOVEMENT','Pre-Crime Surveillance Behavior','CCTV indicates repeated movement near the target before the incident.','ALERT','SUSPECT',1,88.0,false),
(1,'SUGGESTION','Fingerprint Database Search','The partial fingerprint should be cross-referenced with the available forensic database.','INFO','EVIDENCE',2,92.0,false);
