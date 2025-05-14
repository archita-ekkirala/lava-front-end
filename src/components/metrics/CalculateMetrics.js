import * as sk from 'scikitjs';

function brierScoreLoss(yTrue, yProb) {
    if (yTrue.length !== yProb.length) {
        throw new Error("yTrue and yProb must have the same length.");
    }

    let sum = 0;
    for (let i = 0; i < yTrue.length; i++) {
        sum += Math.pow(yTrue[i] - yProb[i], 2);
    }

    return sum / yTrue.length;
}


function rocCurve(actual, predicted) {
    console.log("actual:", actual);
    console.log("predicted:", predicted);

    const combined = actual.map((a, i) => ({ actual: a, predicted: predicted[i] })).sort((a, b) => b.predicted - a.predicted);

    const tprs = [0];  // True positive rate
    const fprs = [0];  // False positive rate

    let tp = 0;
    let fp = 0;

    const n_positive = actual.filter(a => a === 1).length;
    const n_negative = actual.length - n_positive;

    for (let i = 0; i < combined.length; i++) {
        if (combined[i].actual === 1) {
            tp++;
        } else {
            fp++;
        }
        tprs.push(tp / n_positive);
        fprs.push(fp / n_negative);
    }

    return { fpr: fprs, tpr: tprs };
}

export async function CalculateMetrics(yTrue, yPredOriginal) {
    console.log("in calculate metrics")
    const { metrics, model_selection } = sk;

    const yPred = [...yPredOriginal];
    console.log("yPred---" + yPred)

    for (let i = 0; i < yPred.length; i++) {
        if (yPred[i] === 9) {
            yPred[i] = 1 - yTrue[i];
        }
    }

    console.log(yTrue, yPred, { labels: [0, 1] })

    const cm = await metrics.confusionMatrix(yTrue, yPred, { labels: [0, 1] });

    let tn, fp, fn, tp;

    if (cm.length === 2 && cm[0].length === 2) {
        tn = cm[0][0];
        fp = cm[0][1];
        fn = cm[1][0];
        tp = cm[1][1];
    } else {
        tn = cm[0]?.[0] || 0;
        fp = cm[0]?.[1] || 0;
        fn = cm[1]?.[0] || 0;
        tp = cm[1]?.[1] || 0;
    }

    const tpr = tp + fn > 0 ? tp / (tp + fn) : 0;
    const tnr = tn + fp > 0 ? tn / (tn + fp) : 0;
    const fpr = fp + tn > 0 ? fp / (fp + tn) : 0;
    const fnr = fn + tp > 0 ? fn / (fn + tp) : 0;

    const precision = await metrics.precisionScore(yTrue, yPred, { zero_division: 0 });
    const recall = await metrics.recallScore(yTrue, yPred, { zero_division: 0 });
    const f1 = (precision + recall === 0) ? 0 : 2 * (precision * recall) / (precision + recall);
    const brier = brierScoreLoss(yTrue, yPred);

    let auroc = 0;
    if (new Set(yTrue).size > 1) {
        const { fpr: fprVals, tpr: tprVals } = rocCurve(yTrue, yPred);
        auroc = metrics.rocAucScore(fprVals, tprVals);
    }

    const accuracy = (tp + tn) / (tp + tn + fp + fn);

    return {
        'Accuracy': accuracy,
        'True Positive': tp,
        'True Negative': tn,
        'False Positive': fp,
        'False Negative': fn,
        'True Positive Rate': tpr,
        'True Negative Rate': tnr,
        'False Positive Rate': fpr,
        'False Negative Rate': fnr,
        'Precision': precision,
        'Recall': recall,
        'F1 Score': f1,
        'Brier Score': brier,
        'AUROC': auroc
    };
}
