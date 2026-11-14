document.addEventListener("DOMContentLoaded", () => {
    let savedData = localStorage.getItem("resultData");

    if (savedData) {
        let studentData = JSON.parse(savedData);

        // ---------- helpers ----------
        function setText(id, value) {
            document.getElementById(id).textContent = value;
        }

        function getGradeDetails(mark) {
            if (mark >= 90) return { grade: "A+", remark: "Outstanding" };
            if (mark >= 80) return { grade: "A", remark: "Excellent" };
            if (mark >= 60) return { grade: "B+", remark: "Very Good" };
            if (mark >= 45) return { grade: "B", remark: "Good" };
            if (mark >= 25) return { grade: "C", remark: "Pass" };
            return { grade: "D", remark: "Fail" };
        }

        // fills one table row (name is optional – Bengali/English names are fixed)
        function fillRow(prefix, name, marks) {
            let details = getGradeDetails(marks);
            if (name !== null) setText("res-" + prefix + "-name", name);
            setText("res-" + prefix + "-marks", marks);
            setText("res-" + prefix + "-percent", marks + "%");
            setText("res-" + prefix + "-grade", details.grade);
            setText("res-" + prefix + "-remarks", details.remark);
        }

        // ---------- student info ----------
        setText("resName", studentData.name);
        setText("resClass", studentData.className);
        setText("resBoard", studentData.board);

        // ---------- sort the 4 science subjects (high -> low, optional goes down on a tie) ----------
        let electives = [
            { name: "Physics", marks: studentData.marks.Physics },
            { name: "Chemistry", marks: studentData.marks.Chemistry },
            { name: "Mathematics", marks: studentData.marks.Mathematics },
            { name: "Biology", marks: studentData.marks.Biology }
        ];

        electives.sort((a, b) => {
            if (b.marks !== a.marks) {
                return b.marks - a.marks;
            } else {
                if (a.name === studentData.chosenOptional) return 1;
                if (b.name === studentData.chosenOptional) return -1;
                return 0;
            }
        });

        // ---------- table rows ----------
        fillRow("ben", null, studentData.marks.Bengali);
        fillRow("eng", null, studentData.marks.English);
        fillRow("sub1", electives[0].name, electives[0].marks);
        fillRow("sub2", electives[1].name, electives[1].marks);
        fillRow("sub3", electives[2].name, electives[2].marks);
        fillRow("opt", electives[3].name, electives[3].marks);

        // ---------- totals (Best of 5) ----------
        let totalMarks = studentData.marks.Bengali +
                         studentData.marks.English +
                         electives[0].marks +
                         electives[1].marks +
                         electives[2].marks;

        let overallPercentage = (totalMarks / 500) * 100;
        let finalResult = getGradeDetails(overallPercentage);

        setText("resTotalMarks", totalMarks + " / 500");
        setText("resPercentage", overallPercentage.toFixed(2) + "%");
        setText("resFinalGrade", finalResult.grade);
        setText("resFinalRemarks", finalResult.remark);
        setText("resOptionalSub", electives[3].name);

        // ---------- download (browser print / save as PDF) ----------
        document.getElementById("downloadBtn").addEventListener("click", function () {
            window.print();
        });

        // ---------- charts & visual layer (UI only) ----------
        if (window.ResultUI) {
            window.ResultUI.render({
                marks: studentData.marks,
                top5: [
                    { name: "Bengali", marks: studentData.marks.Bengali },
                    { name: "English", marks: studentData.marks.English },
                    { name: electives[0].name, marks: electives[0].marks },
                    { name: electives[1].name, marks: electives[1].marks },
                    { name: electives[2].name, marks: electives[2].marks }
                ],
                dropped: { name: electives[3].name, marks: electives[3].marks },
                total: totalMarks,
                pct: overallPercentage,
                grade: getGradeDetails,
                studentName: studentData.name
            });
        }

    } else {
        alert("Data missing! Redirecting to the form page...");
        window.location.href = "index.html";
    }
});
