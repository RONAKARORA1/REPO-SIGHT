#pragma once
 
#include "metrics/DependencyGraph.h"
#include "metrics/HotspotReport.h"
#include "metrics/Metrics.h"
#include "metrics/ViolationReport.h"
#include "parser/ParseResult.h"
#include "report/HealthScore.h"
 
#include <ostream>
#include <string>
#include <unordered_map>
#include <utility>
#include <vector>
 
namespace cma {
 
class ReportGenerator {
public:
    static void printSummary(const ProjectMetrics& metrics, std::ostream& out);
    [[nodiscard]] static bool saveToFile(const ProjectMetrics& metrics,
                                          const std::string& outputPath);
 
    // -- Phase 4 Sprint 1 (P0-1/P0-2) --
    [[nodiscard]] static std::string toJson(
        const ProjectMetrics& metrics,
        const std::vector<std::pair<std::string, FileMetrics>>& files);
 
    [[nodiscard]] static bool saveJsonToFile(
        const ProjectMetrics& metrics,
        const std::vector<std::pair<std::string, FileMetrics>>& files,
        const std::string& outputPath);
 
    // -- Phase 4 Sprint 2 (P0-6 dependency graph) --
    [[nodiscard]] static std::string toJson(
        const ProjectMetrics& metrics,
        const std::vector<std::pair<std::string, FileMetrics>>& files,
        const DependencyGraph& graph);
 
    [[nodiscard]] static bool saveJsonToFile(
        const ProjectMetrics& metrics,
        const std::vector<std::pair<std::string, FileMetrics>>& files,
        const DependencyGraph& graph,
        const std::string& outputPath);
 
    // -- Phase 4 Sprint 3 (P0-4 hotspot scoring) --
    [[nodiscard]] static std::string toJson(
        const ProjectMetrics& metrics,
        const std::vector<std::pair<std::string, FileMetrics>>& files,
        const DependencyGraph& graph,
        const HotspotReport& hotspots);
 
    [[nodiscard]] static bool saveJsonToFile(
        const ProjectMetrics& metrics,
        const std::vector<std::pair<std::string, FileMetrics>>& files,
        const DependencyGraph& graph,
        const HotspotReport& hotspots,
        const std::string& outputPath);
 
    // -- Phase 4 Sprint 3B (rule violations) -- adds a top-level
    // "violations" array and never changes the 2/3/4-arg overloads' output.
    [[nodiscard]] static std::string toJson(
        const ProjectMetrics& metrics,
        const std::vector<std::pair<std::string, FileMetrics>>& files,
        const DependencyGraph& graph,
        const HotspotReport& hotspots,
        const ViolationReport& violations);
 
    [[nodiscard]] static bool saveJsonToFile(
        const ProjectMetrics& metrics,
        const std::vector<std::pair<std::string, FileMetrics>>& files,
        const DependencyGraph& graph,
        const HotspotReport& hotspots,
        const ViolationReport& violations,
        const std::string& outputPath);
 
    [[nodiscard]] static std::string toBadgeSvg(const ProjectMetrics& metrics);
    [[nodiscard]] static bool saveBadgeToFile(const ProjectMetrics& metrics,
                                               const std::string& outputPath);
 
private:
    static void writeReport(const ProjectMetrics& metrics, std::ostream& out);
 
    static void writeJson(
        const ProjectMetrics& metrics,
        const std::vector<std::pair<std::string, FileMetrics>>& files,
        const DependencyGraph* graph,
        const HotspotReport* hotspots,
        const ViolationReport* violations,
        std::ostream& out);
 
    static void writeDependenciesJson(
        const std::unordered_map<std::string, const FileCoupling*>& couplingByPath,
        const std::string& path,
        std::ostream& out);
 
    static void writeHotspotsJson(const HotspotReport& hotspots, std::ostream& out);
 
    static void writeViolationsJson(const ViolationReport& violations, std::ostream& out);
 
    [[nodiscard]] static std::string jsonEscape(const std::string& s);
 
    static void writeFileMetricsJson(const FileMetrics& fm, std::ostream& out);
};
 
} // namespace cma
 
