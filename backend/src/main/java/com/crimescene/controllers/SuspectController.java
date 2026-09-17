package com.crimescene.controllers;

import com.crimescene.algorithms.*;
import com.crimescene.models.*;
import com.crimescene.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Suspect Controller — manage suspects + path prediction
 */
@RestController
@RequestMapping("/api/suspects")
@RequiredArgsConstructor
@CrossOrigin
public class SuspectController {

    private final SuspectRepository suspectRepository;
    private final CaseRepository caseRepository;
    private final UserRepository userRepository;
    private final EvidenceRepository evidenceRepository;
    private final WitnessRepository witnessRepository;
    private final TimelineEventRepository timelineEventRepository;
    private final LocationRepository locationRepository;
    private final DijkstraAlgorithm dijkstraAlgorithm;
    private final AStarAlgorithm aStarAlgorithm;
    private final ProbabilityScorer probabilityScorer;

    /** GET /api/suspects/case/{caseId} */
    @GetMapping("/case/{caseId}")
    public ResponseEntity<List<Suspect>> getSuspectsByCase(@PathVariable Long caseId) {
        return ResponseEntity.ok(
            suspectRepository.findByCaseEntityIdOrderByProbabilityScoreDesc(caseId)
        );
    }

    /** GET /api/suspects/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<?> getSuspect(@PathVariable Long id) {
        return suspectRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /** POST /api/suspects */
    @PostMapping
    public ResponseEntity<?> addSuspect(@RequestBody SuspectRequest request) {
        Case c = caseRepository.findById(request.caseId())
            .orElseThrow(() -> new RuntimeException("Case not found"));

        Suspect s = new Suspect();
        s.setCaseEntity(c);
        s.setName(request.name());
        s.setAlias(request.alias());
        s.setAge(request.age());
        s.setDescription(request.description());
        s.setLastKnownLocation(request.lastKnownLocation());
        s.setLastSeenLatitude(request.lastSeenLatitude());
        s.setLastSeenLongitude(request.lastSeenLongitude());
        s.setCriminalRecord(request.criminalRecord());
        s.setNotes(request.notes());
        s.setStatus(Suspect.SuspectStatus.PERSON_OF_INTEREST);

        if (request.addedById() != null) {
            userRepository.findById(request.addedById()).ifPresent(s::setAddedBy);
        }

        return ResponseEntity.ok(suspectRepository.save(s));
    }

    /** PUT /api/suspects/{id}/status */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return suspectRepository.findById(id).map(s -> {
            s.setStatus(Suspect.SuspectStatus.valueOf(body.get("status").toUpperCase()));
            return ResponseEntity.ok(suspectRepository.save(s));
        }).orElse(ResponseEntity.notFound().build());
    }

    /**
     * POST /api/suspects/{id}/calculate-score
     * Runs the probability scoring engine on this suspect.
     */
    @PostMapping("/{id}/calculate-score")
    public ResponseEntity<?> calculateScore(@PathVariable Long id) {
        return suspectRepository.findById(id).map(s -> {
            Long caseId = s.getCaseEntity().getId();
            Case c = s.getCaseEntity();

            List<Evidence> evidence = evidenceRepository.findByCaseEntityId(caseId);
            List<Witness> witnesses = witnessRepository.findByCaseEntityId(caseId);
            List<TimelineEvent> timeline = timelineEventRepository
                .findByCaseEntityIdOrderByEventTimeAsc(caseId);

            double lat = c.getLatitude() != null ? c.getLatitude() : 0;
            double lng = c.getLongitude() != null ? c.getLongitude() : 0;

            ProbabilityScorer.ScoreResult result = probabilityScorer.calculateScore(
                s, evidence, timeline, witnesses, lat, lng, c.getIncidentDate()
            );

            // Persist scores
            s.setProbabilityScore(result.compositeScore());
            s.setEvidenceMatchScore(result.evidenceMatchScore());
            s.setProximityScore(result.proximityScore());
            s.setTimelineScore(result.timelineScore());
            s.setBehaviorScore(result.behaviorScore());
            suspectRepository.save(s);

            return ResponseEntity.ok(Map.of(
                "compositeScore",     result.compositeScore(),
                "evidenceMatchScore", result.evidenceMatchScore(),
                "proximityScore",     result.proximityScore(),
                "timelineScore",      result.timelineScore(),
                "behaviorScore",      result.behaviorScore(),
                "riskLevel",          result.getRiskLevel()
            ));
        }).orElse(ResponseEntity.notFound().build());
    }

    /**
     * POST /api/suspects/{id}/predict-path
     * Uses Dijkstra + A* to predict suspect escape route from crime scene.
     */
    @PostMapping("/{id}/predict-path")
    public ResponseEntity<?> predictPath(@PathVariable Long id,
                                          @RequestBody PathRequest request) {
        return suspectRepository.findById(id).map(s -> {
            Long caseId = s.getCaseEntity().getId();
            List<Location> locations = locationRepository.findByCaseEntityId(caseId);

            if (locations.size() < 2) {
                // Generate synthetic demo nodes around crime scene
                locations = generateDemoLocations(s.getCaseEntity(), s);
            }

            // Build node list for Dijkstra
            List<DijkstraAlgorithm.LocationPoint> points = locations.stream()
                .map(l -> new DijkstraAlgorithm.LocationPoint(
                    String.valueOf(l.getId()), l.getName(), l.getLatitude(), l.getLongitude()))
                .toList();

            Map<String, DijkstraAlgorithm.GraphNode> graph =
                dijkstraAlgorithm.buildGraphFromLocations(points, 5.0); // 5km connection radius

            String sourceId = String.valueOf(locations.get(0).getId());
            String targetId = String.valueOf(locations.get(locations.size() - 1).getId());

            // Run Dijkstra
            DijkstraAlgorithm.PathResult dijkstraResult =
                dijkstraAlgorithm.findShortestPath(graph, sourceId, targetId);

            // Build coord map for A*
            Map<String, Map<String, Double>> adjMap = new HashMap<>();
            Map<String, double[]> coords = new HashMap<>();
            for (Location l : locations) {
                String lid = String.valueOf(l.getId());
                coords.put(lid, new double[]{l.getLatitude(), l.getLongitude()});
                DijkstraAlgorithm.GraphNode node = graph.get(lid);
                if (node != null) adjMap.put(lid, node.neighbors);
            }

            // Run A*
            DijkstraAlgorithm.PathResult astarResult =
                aStarAlgorithm.findPath(adjMap, coords, sourceId, targetId);

            // Build path coordinates for frontend map
            List<Map<String, Object>> pathCoords = new ArrayList<>();
            for (String nodeId : dijkstraResult.path) {
                Location loc = locations.stream()
                    .filter(l -> String.valueOf(l.getId()).equals(nodeId))
                    .findFirst().orElse(null);
                if (loc != null) {
                    pathCoords.add(Map.of(
                        "id", nodeId, "name", loc.getName(),
                        "lat", loc.getLatitude(), "lng", loc.getLongitude()
                    ));
                }
            }

            // Store predicted path
            s.setPredictedPath(pathCoords.toString());
            suspectRepository.save(s);

            return ResponseEntity.ok(Map.of(
                "algorithm", "Dijkstra + A*",
                "dijkstraPath", dijkstraResult.path,
                "astarPath", astarResult.path,
                "totalDistanceKm", dijkstraResult.pathFound ? dijkstraResult.totalDistance : 0,
                "pathFound", dijkstraResult.pathFound,
                "pathCoordinates", pathCoords,
                "nodeCount", locations.size()
            ));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** DELETE /api/suspects/{id} */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSuspect(@PathVariable Long id) {
        if (!suspectRepository.existsById(id)) return ResponseEntity.notFound().build();
        suspectRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Suspect deleted"));
    }

    // Generate synthetic location nodes for demo when no locations are configured
    private List<Location> generateDemoLocations(Case c, Suspect s) {
        List<Location> demo = new ArrayList<>();
        double baseLat = c.getLatitude() != null ? c.getLatitude() : 12.9716;
        double baseLng = c.getLongitude() != null ? c.getLongitude() : 77.5946;

        String[][] nodes = {
            {"Crime Scene",   "0",     "0"},
            {"Street Corner", "0.002", "0.002"},
            {"Market Area",   "-0.001","0.004"},
            {"Alley Exit",    "0.003", "0.006"},
            {"Bus Terminal",  "0.005", "0.008"},
        };

        for (String[] n : nodes) {
            Location l = new Location();
            l.setName(n[0]);
            l.setLatitude(baseLat + Double.parseDouble(n[1]));
            l.setLongitude(baseLng + Double.parseDouble(n[2]));
            l.setType("CHECKPOINT");
            l.setCaseEntity(c);
            demo.add(locationRepository.save(l));
        }
        return demo;
    }

    public record SuspectRequest(
        Long caseId, String name, String alias, Integer age,
        String description, String lastKnownLocation,
        Double lastSeenLatitude, Double lastSeenLongitude,
        String criminalRecord, String notes, Long addedById
    ) {}

    public record PathRequest(String sourceLocationId, String targetLocationId) {}
}
